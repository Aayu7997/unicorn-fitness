import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
// Reuse the YAML parser in the committed npm lockfile (via @prisma/config → c12).
import { parseYAML } from "confbox/yaml";

// Explicit invocation: node --test .github/tests/security-workflow.test.mjs
// These tests inspect configuration and stub npm; they never contact scanners or registries.
const workflow = parseYAML(
  readFileSync(new URL("../workflows/security.yml", import.meta.url), "utf8"),
);

function actionStep(job, action) {
  const matches = job.steps.filter((step) => step.uses?.startsWith(`${action}@`));
  assert.equal(matches.length, 1, `Expected one ${action} step`);
  return matches[0];
}

function auditStep() {
  const matches = workflow.jobs["dependency-audit"].steps.filter(
    (step) => typeof step.run === "string" && /\bnpm\s+audit\b/.test(step.run),
  );
  assert.equal(matches.length, 1, "Expected one npm audit command");
  return matches[0];
}

describe("security workflow triggers and concurrency", () => {
  for (const event of ["push", "pull_request"]) {
    it(`scans all changes targeting main on ${event}`, () => {
      const trigger = workflow.on[event];
      assert.deepEqual(trigger.branches, ["main"]);
      for (const filter of ["branches-ignore", "paths", "paths-ignore", "types"]) {
        assert.equal(trigger[filter], undefined, `${event} must not exclude changes via ${filter}`);
      }
    });
  }

  it("runs the weekly scan at midnight UTC on Mondays", () => {
    assert.deepEqual(workflow.on.schedule, [{ cron: "0 0 * * 1" }]);
  });

  it("uses the unprivileged pull request event", () => {
    assert.ok(Object.hasOwn(workflow.on, "pull_request"));
    assert.equal(workflow.on.pull_request_target, undefined);
  });

  it("cancels stale runs while isolating workflows and branch or PR refs", () => {
    assert.equal(workflow.concurrency["cancel-in-progress"], true);
    assert.match(
      workflow.concurrency.group,
      /^\$\{\{\s*github\.workflow\s*\}\}-\$\{\{\s*github\.ref\s*\}\}$/,
    );
  });
});

describe("security jobs", () => {
  for (const id of ["semgrep-audit", "dependency-audit"]) {
    it(`${id} runs independently on every configured event`, () => {
      const job = workflow.jobs[id];
      assert.equal(job["runs-on"], "ubuntu-latest");
      assert.equal(job.if, undefined, "Do not silently skip security scans");
      assert.equal(job.needs, undefined, "One audit must not block the other from running");
      for (const step of job.steps) {
        assert.equal(step.if, undefined, `${step.name} must not be conditionally skipped`);
        assert.ok(
          [undefined, false].includes(step["continue-on-error"]),
          `${step.name} must surface errors`,
        );
      }
    });

    it(`${id} checks out the event revision before scanning`, () => {
      const job = workflow.jobs[id];
      const checkout = actionStep(job, "actions/checkout");
      assert.equal(job.steps.indexOf(checkout), 0);
      assert.equal(checkout.with?.ref, undefined, "Do not scan a fixed branch instead of the PR");
      assert.equal(checkout.with?.repository, undefined, "Scan this repository");
      assert.equal(checkout.with?.path, undefined, "Keep sources in the default workspace");
    });
  }
});

describe("Semgrep scan configuration", () => {
  it("keeps source security scan failures blocking", () => {
    assert.ok(
      [undefined, false].includes(workflow.jobs["semgrep-audit"]["continue-on-error"]),
    );
  });

  it("runs Semgrep after checking out the source", () => {
    const job = workflow.jobs["semgrep-audit"];
    const checkout = actionStep(job, "actions/checkout");
    const scan = actionStep(job, "semgrep/semgrep-action");
    assert.ok(job.steps.indexOf(scan) > job.steps.indexOf(checkout));
  });

  it("includes security and framework rules as distinct folded YAML entries", () => {
    const scan = actionStep(workflow.jobs["semgrep-audit"], "semgrep/semgrep-action");
    const rules = scan.with.config.trim().split(/\s+/);
    for (const rule of [
      "p/security-audit",
      "p/owasp-top-ten",
      "p/javascript",
      "p/typescript",
      "p/react",
      "p/nextjs",
    ]) {
      assert.ok(rules.includes(rule), `Missing Semgrep rule pack: ${rule}`);
    }
    assert.equal(new Set(rules).size, rules.length, "Avoid duplicate rule packs");
    assert.equal(scan.env.SEMGREP_RULES, "p/default");
  });
});

describe("dependency vulnerability audit", () => {
  it("keeps dependency findings advisory at the job level", () => {
    assert.equal(workflow.jobs["dependency-audit"]["continue-on-error"], true);
  });

  it("sets up the declared Node runtime before auditing", () => {
    const job = workflow.jobs["dependency-audit"];
    const checkout = actionStep(job, "actions/checkout");
    const setup = actionStep(job, "actions/setup-node");
    assert.equal(String(setup.with["node-version"]), "20");
    assert.ok(job.steps.indexOf(checkout) < job.steps.indexOf(setup));
    assert.ok(job.steps.indexOf(setup) < job.steps.indexOf(auditStep()));
  });

  it("audits the root lockfile at high severity with an explicit advisory fallback", () => {
    const job = workflow.jobs["dependency-audit"];
    const audit = auditStep();
    assert.equal(workflow.defaults?.run?.["working-directory"], undefined);
    assert.equal(job.defaults?.run?.["working-directory"], undefined);
    assert.equal(audit["working-directory"], undefined);
    assert.deepEqual(audit.run.trim().split(/\s+/), ["npm", "audit", "--audit-level=high", "||", "true"]);
  });

  for (const [status, scenario] of [
    [0, "a clean dependency report"],
    [1, "high or critical vulnerabilities"],
    [2, "an audit service error"],
  ]) {
    it(`completes successfully after npm reports ${scenario} (exit ${status})`, () => {
      const audit = auditStep();
      // Only execute the expected audit command, with an isolated npm stub.
      assert.deepEqual(audit.run.trim().split(/\s+/), ["npm", "audit", "--audit-level=high", "||", "true"]);
      assert.equal(audit.shell, undefined, "This test exercises the runner's default Bash shell");
      assert.equal(workflow.defaults?.run?.shell, undefined);
      assert.equal(workflow.jobs["dependency-audit"].defaults?.run?.shell, undefined);

      const directory = mkdtempSync(join(tmpdir(), "security-workflow-test-"));
      try {
        writeFileSync(
          join(directory, "npm"),
          '#!/bin/sh\nprintf "%s\\n" "$@"\nexit "$AUDIT_TEST_EXIT"\n',
          { mode: 0o755 },
        );
        const result = spawnSync("/bin/bash", ["-e", "-c", audit.run], {
          cwd: directory,
          env: { PATH: directory, AUDIT_TEST_EXIT: String(status) },
          encoding: "utf8",
          timeout: 2000,
        });
        assert.ifError(result.error);
        assert.equal(result.signal, null);
        assert.equal(result.status, 0, result.stderr);
        assert.deepEqual(result.stdout.trim().split("\n"), ["audit", "--audit-level=high"]);
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    });
  }
});
