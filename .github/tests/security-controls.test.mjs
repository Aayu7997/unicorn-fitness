import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Load modules via tsImport from tsx for Node 20 runtime compatibility
const { tsImport } = await import("tsx/esm/api");
const rawCookies = await tsImport("../../lib/cookies.ts", import.meta.url);
const cookiesMod = rawCookies?.AUTH_COOKIE_NAME ? rawCookies : (rawCookies?.default || rawCookies);

const {
  isSecureContext,
  getAuthCookieOptions,
  getOAuthStateCookieOptions,
  getDeleteCookieOptions,
} = cookiesMod;

const rawRobots = await tsImport("../../app/robots.ts", import.meta.url);
const robots = rawRobots?.default?.default || rawRobots?.default || rawRobots;

const rawSitemap = await tsImport("../../app/sitemap.ts", import.meta.url);
const sitemap = rawSitemap?.default?.default || rawSitemap?.default || rawSitemap;

describe("OWASP Top 20 Security Controls & Configurations", () => {
  describe("Cookie Security & Secure Context (OWASP A02 / A07)", () => {
    it("evaluates https protocol and headers safely", () => {
      assert.equal(isSecureContext("https:"), true);
      assert.equal(isSecureContext("https"), true);

      const headers = new Headers({ "x-forwarded-proto": "https" });
      assert.equal(isSecureContext(headers), true);
    });

    it("enforces HttpOnly, SameSite, and Priority on session cookies", () => {
      const options = getAuthCookieOptions(false, true);
      assert.equal(options.httpOnly, true);
      assert.equal(options.secure, true);
      assert.equal(options.sameSite, "lax");
      assert.equal(options.path, "/");
      assert.equal(options.priority, "high");
      assert.equal(options.maxAge, 24 * 60 * 60);
    });

    it("enforces transient 10-minute expiry on OAuth state cookies", () => {
      const options = getOAuthStateCookieOptions(true);
      assert.equal(options.httpOnly, true);
      assert.equal(options.secure, true);
      assert.equal(options.sameSite, "lax");
      assert.equal(options.maxAge, 10 * 60);
    });

    it("properly zeroes maxAge for cookie deletion", () => {
      const options = getDeleteCookieOptions(true);
      assert.equal(options.maxAge, 0);
      assert.equal(options.httpOnly, true);
      assert.equal(options.path, "/");
    });
  });

  describe("Robots.txt & Sitemap Crawler Directives (OWASP A01 / A05)", () => {
    it("disallows administrative and sensitive auth endpoints in robots.ts", () => {
      const robotConfig = robots();
      assert.ok(Array.isArray(robotConfig.rules));

      const wildcardRule = robotConfig.rules.find((r) => r.userAgent === "*");
      assert.ok(wildcardRule, "Missing wildcard crawler rule");

      const disallowed = wildcardRule.disallow;
      assert.ok(disallowed.includes("/admin/"));
      assert.ok(disallowed.includes("/dashboard/"));
      assert.ok(disallowed.includes("/api/"));
      assert.ok(disallowed.includes("/signin"));
      assert.ok(disallowed.includes("/signup"));
      assert.ok(disallowed.includes("/login"));
      assert.ok(disallowed.includes("/forgot-password"));
      assert.ok(disallowed.includes("/reset-password"));
    });

    it("defines restricted rules for automated AI scrapers", () => {
      const robotConfig = robots();
      const aiRule = robotConfig.rules.find(
        (r) => Array.isArray(r.userAgent) && r.userAgent.includes("GPTBot")
      );
      assert.ok(aiRule, "Expected dedicated AI bot crawler restrictions");
      assert.ok(aiRule.disallow.includes("/admin/"));
      assert.ok(aiRule.disallow.includes("/api/"));
    });

    it("excludes disallowed auth and administrative paths from public sitemap", () => {
      const entries = sitemap();
      const urls = entries.map((e) => e.url);

      for (const forbidden of ["/signin", "/signup", "/admin", "/dashboard"]) {
        const found = urls.some((u) => u.endsWith(forbidden));
        assert.equal(found, false, `Sitemap must not expose ${forbidden}`);
      }
    });
  });

  describe("RFC 9116 Vulnerability Disclosure (security.txt)", () => {
    it("provides valid security.txt in public/.well-known/", () => {
      const secFilePath = join(process.cwd(), "public", ".well-known", "security.txt");
      assert.ok(existsSync(secFilePath), "public/.well-known/security.txt must exist");

      const content = readFileSync(secFilePath, "utf8");
      assert.match(content, /^Contact:\s+mailto:/m);
      assert.match(content, /^Expires:\s+\d{4}-\d{2}-\d{2}T/m);
      assert.match(content, /^Preferred-Languages:\s+/m);
      assert.match(content, /^Canonical:\s+https?:\/\//m);
      assert.match(content, /^Policy:\s+https?:\/\//m);
    });
  });
});
