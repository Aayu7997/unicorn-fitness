import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { parseYAML } from "confbox/yaml";

// Run: node --test .github/tests/ci-workflow.test.mjs
// Execute only the install steps, with npm stubbed; no dependencies are installed.
const workflow = parseYAML(
  readFileSync(new URL("../workflows/ci.yml", import.meta.url), "utf8"),
);

function installStep(job) {
  const matches = job.steps.filter(
    (step) => typeof step.run === "string" && /\bnpm\s+ci\b/.test(step.run),
  );
  assert.equal(matches.length, 1, "Expected exactly one lockfile install step");
  return matches[0];
}

for (const [id, directory, verification] of [
  ["web-tests", ".", "npm run typecheck"],
  ["mobile-tests", "./mobile", "npx tsc --noEmit"],
]) {
  describe(`${id} dependency installation`, () => {
    it("uses the committed lockfile and permits existing peer dependency conflicts", () => {
      const job = workflow.jobs[id];
      const install = installStep(job);
      assert.deepEqual(install.run.trim().split(/\s+/), ["npm", "ci", "--legacy-peer-deps"]);
      assert.equal(
        install["working-directory"] ?? job.defaults?.run?.["working-directory"] ??
          workflow.defaults?.run?.["working-directory"] ?? ".",
        directory,
      );
      const checkout = job.steps.findIndex((step) => step.uses?.startsWith("actions/checkout@"));
      const setup = job.steps.findIndex((step) => step.uses?.startsWith("actions/setup-node@"));
      const check = job.steps.findIndex((step) => step.run?.trim() === verification);
      assert.ok(checkout >= 0 && checkout < setup);
      assert.ok(setup < job.steps.indexOf(install));
      assert.ok(job.steps.indexOf(install) < check, "Install before verification");
      assert.ok([undefined, false].includes(job["continue-on-error"]));
      assert.ok([undefined, false].includes(install["continue-on-error"]));
      assert.equal(install.if, undefined, "Do not skip installation");
    });

    for (const status of [0, 1]) {
      it(`passes the install arguments in the correct directory and preserves exit ${status}`, () => {
        const job = workflow.jobs[id];
        const install = installStep(job);
        // Whitelist the command before executing workflow text in an isolated shell.
        assert.deepEqual(install.run.trim().split(/\s+/), ["npm", "ci", "--legacy-peer-deps"]);
        assert.equal(install.shell, undefined);
        assert.equal(job.defaults?.run?.shell, undefined);
        assert.equal(workflow.defaults?.run?.shell, undefined);

        const workspace = mkdtempSync(join(tmpdir(), "ci-install-test-"));
        try {
          const bin = join(workspace, "bin");
          mkdirSync(bin);
          mkdirSync(join(workspace, "mobile"));
          writeFileSync(
            join(bin, "npm"),
            '#!/bin/sh\nprintf "%s\\n" "$PWD" "$@"\nexit "$INSTALL_TEST_EXIT"\n',
            { mode: 0o755 },
          );
          const cwd = join(workspace, install["working-directory"] ?? ".");
          const result = spawnSync("/bin/bash", ["-e", "-c", install.run], {
            cwd,
            env: { PATH: bin, INSTALL_TEST_EXIT: String(status) },
            encoding: "utf8",
            timeout: 2000,
          });
          assert.ifError(result.error);
          assert.equal(result.signal, null);
          assert.equal(result.status, status, result.stderr);
          assert.deepEqual(result.stdout.trim().split("\n"), [
            join(workspace, directory), "ci", "--legacy-peer-deps",
          ]);
        } finally {
          rmSync(workspace, { recursive: true, force: true });
        }
      });
    }
  });
}
