import assert from "node:assert/strict";
import { describe, it } from "node:test";

const { getClientIp } = await import("../../lib/rate-limit.ts");

describe("getClientIp - rate limit security & IP resolution", () => {
  it("when trustProxy is disabled, returns platformIp if non-empty", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.195, 70.41.3.18",
      "x-real-ip": "203.0.113.195",
      "cf-connecting-ip": "203.0.113.195",
    });

    // Explicitly disabled trustProxy with valid platformIp
    const ip = getClientIp(headers, {
      trustProxy: false,
      platformIp: " 198.51.100.42 ",
    });
    assert.equal(ip, "198.51.100.42");
  });

  it("when trustProxy is disabled, returns unknown when platformIp is missing or whitespace", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.195",
    });

    assert.equal(getClientIp(headers, { trustProxy: false }), "unknown");
    assert.equal(getClientIp(headers, { trustProxy: false, platformIp: "" }), "unknown");
    assert.equal(getClientIp(headers, { trustProxy: false, platformIp: "   " }), "unknown");
  });

  it("does not read proxy headers when trustProxy is disabled", () => {
    const headers = new Headers({
      "x-forwarded-for": "203.0.113.195",
      "x-real-ip": "203.0.113.50",
      "cf-connecting-ip": "203.0.113.60",
    });

    const ip = getClientIp(headers, { trustProxy: false });
    assert.equal(ip, "unknown");
  });

  it("validates trustedHops as positive integer and falls back to 1 for invalid values", () => {
    const headers = new Headers({
      "x-forwarded-for": "client.ip, proxy1.ip, proxy2.ip",
    });

    // Valid positive integer 2 -> parts.length (3) - 2 = index 1 -> proxy1.ip
    assert.equal(
      getClientIp(headers, { trustProxy: true, trustedHops: 2 }),
      "proxy1.ip"
    );

    // Valid positive integer 1 -> parts.length (3) - 1 = index 2 -> proxy2.ip
    assert.equal(
      getClientIp(headers, { trustProxy: true, trustedHops: 1 }),
      "proxy2.ip"
    );

    // Valid positive integer 3 -> parts.length (3) - 3 = index 0 -> client.ip
    assert.equal(
      getClientIp(headers, { trustProxy: true, trustedHops: 3 }),
      "client.ip"
    );

    // trustedHops > parts.length clamps to index 0
    assert.equal(
      getClientIp(headers, { trustProxy: true, trustedHops: 10 }),
      "client.ip"
    );

    // Fallbacks to 1 for NaN, fractional, zero, negative
    assert.equal(
      getClientIp(headers, { trustProxy: true, trustedHops: Number.NaN }),
      "proxy2.ip"
    );
    assert.equal(
      getClientIp(headers, { trustProxy: true, trustedHops: 1.5 }),
      "proxy2.ip"
    );
    assert.equal(
      getClientIp(headers, { trustProxy: true, trustedHops: 0 }),
      "proxy2.ip"
    );
    assert.equal(
      getClientIp(headers, { trustProxy: true, trustedHops: -1 }),
      "proxy2.ip"
    );
    assert.equal(
      getClientIp(headers, { trustProxy: true, trustedHops: -10 }),
      "proxy2.ip"
    );
  });

  it("trustedHeader selects cf-connecting-ip or x-real-ip only when explicitly set", () => {
    const headers = new Headers({
      "cf-connecting-ip": " 1.1.1.1 ",
      "x-real-ip": " 2.2.2.2 ",
      "x-forwarded-for": "client.ip, proxy.ip",
    });

    // Without trustedHeader option, proxy headers DO NOT bypass trustedHops
    assert.equal(
      getClientIp(headers, { trustProxy: true }),
      "proxy.ip"
    );

    // Explicitly setting cf-connecting-ip
    assert.equal(
      getClientIp(headers, { trustProxy: true, trustedHeader: "cf-connecting-ip" }),
      "1.1.1.1"
    );

    // Explicitly setting x-real-ip
    assert.equal(
      getClientIp(headers, { trustProxy: true, trustedHeader: "x-real-ip" }),
      "2.2.2.2"
    );
  });

  it("falls through to trustedHops when trustedHeader is empty or missing", () => {
    const headers = new Headers({
      "cf-connecting-ip": "   ",
      "x-forwarded-for": "client.ip, proxy.ip",
    });

    assert.equal(
      getClientIp(headers, {
        trustProxy: true,
        trustedHeader: "cf-connecting-ip",
        trustedHops: 1,
      }),
      "proxy.ip"
    );
  });

  it("falls back to platformIp or unknown when no headers match", () => {
    const headers = new Headers({});

    assert.equal(
      getClientIp(headers, { trustProxy: true, platformIp: "10.0.0.1" }),
      "10.0.0.1"
    );
    assert.equal(
      getClientIp(headers, { trustProxy: true }),
      "unknown"
    );
  });
});
