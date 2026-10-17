import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it, mock } from "node:test";
import { Script } from "node:vm";
import * as jsxRuntime from "react/jsx-runtime";
import ts from "typescript";

// Run: node --test app/__tests__/page-fallbacks.test.mjs
// Use the installed TypeScript compiler to load the actual server pages. Stub only
// imports at their boundaries so Prisma and client components never initialize.
// No generated JS, database, Next server, DOM, or additional test packages needed.
const compiledModules = new Map();
function loadModule(path, imports = {}, warnings = []) {
  if (!compiledModules.has(path)) {
    const source = readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
    const { outputText, diagnostics } = ts.transpileModule(source, {
      fileName: path,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
      },
      reportDiagnostics: true,
    });
    assert.deepEqual(diagnostics, [], `Could not compile ${path}`);
    compiledModules.set(path, new Script(
      `(function(exports, require, console) {\n${outputText}\n})`,
      { filename: path },
    ).runInThisContext());
  }
  const exports = {};
  compiledModules.get(path)(exports, (name) => {
    assert.ok(Object.hasOwn(imports, name), `Unexpected import ${name} in ${path}`);
    return imports[name];
  }, { warn: (...args) => warnings.push(args) });
  return exports;
}

const staticData = loadModule("lib/indian-data.ts");
const components = {
  "@/components/hero-pinned": "HeroPinned",
  "@/components/stats-counter": "StatsCounter",
  "@/components/fade-section": "FadeSection",
  "@/components/horizontal-scroll": "HorizontalScroll",
  "@/components/depth-section": "DepthSection",
  "@/components/parallax-image": "ParallaxImage",
  "@/components/pricing-section": "PricingSection",
  "@/components/team-section": "TeamSection",
  "@/components/faq-section": "FAQSection",
  "@/components/text-marquee": "TextMarquee",
  "@/components/programs-section": "ProgramsSection",
  "@/components/testimonials-section": "TestimonialsSection",
  "@/components/gallery-section": "GallerySection",
  "@/components/ui/kinetic-text": "KineticText",
  "./gallery-client": "GalleryClient",
};
const componentImports = Object.fromEntries(
  Object.entries(components).map(([path, name]) => [path, { [name]: name }]),
);

function loadPage(path, prisma) {
  const warnings = [];
  const exports = loadModule(path, {
    ...componentImports,
    "react/jsx-runtime": jsxRuntime,
    "@/lib/prisma": { prisma },
    "@/lib/indian-data": staticData,
    "lucide-react": Object.fromEntries(
      ["Dumbbell", "Users", "Clock", "Zap", "Target", "Heart", "TrendingUp", "Award", "Trophy"]
        .map((name) => [name, name]),
    ),
  }, warnings);
  return { Page: exports.default, warnings };
}

// Inspect the server component's returned React tree without executing children.
function propsFor(tree, component) {
  const matches = [];
  function visit(node) {
    if (Array.isArray(node)) {
      node.forEach(visit);
    } else if (node && typeof node === "object" && node.props) {
      if (node.type === component) matches.push(node.props);
      visit(node.props.children);
    }
  }
  visit(tree);
  assert.equal(matches.length, 1, `Expected one ${component}`);
  return matches[0];
}

const collections = [
  ["program", "ProgramsSection", "programs", staticData.indianPrograms],
  ["trainer", "TeamSection", "trainers", staticData.indianTrainers],
  ["testimonial", "TestimonialsSection", "testimonials", staticData.indianTestimonials],
  ["plan", "PricingSection", "plans", staticData.indianMembershipPlans],
  ["fAQ", "FAQSection", "faqs", staticData.indianFaqs],
  ["galleryImage", "GallerySection", "images", []],
];
const queryOrder = ["program", "trainer", "testimonial", "siteContent", "plan", "fAQ", "galleryImage"];
const siteContent = {
  hero: { title: "Database hero", cta: "Join today" },
  stats: { members: "2,400+", trainers: "8", programs: "12+", years: "9 years" },
  attributes: [{ title: "Personal coaching" }],
};

function databaseResults() {
  return {
    ...Object.fromEntries(collections.map(([model, , , fallback]) => [
      model,
      fallback.length
        ? fallback.slice(0, 2).map((row) => ({ ...row, id: `db-${row.id}` }))
        : [{ id: "db-image", title: "Gym", imageUrl: "/gym.jpg", category: "Facilities" }],
    ])),
    siteContent: { content: siteContent },
  };
}

function createPrisma(results = databaseResults(), rejections = {}) {
  return Object.fromEntries(queryOrder.map((model) => [model, {
    [model === "siteContent" ? "findUnique" : "findMany"]: mock.fn(async () => {
      if (Object.hasOwn(rejections, model)) throw rejections[model];
      return results[model];
    }),
  }]));
}

function assertCollections(tree, expected, fields = collections) {
  for (const [model, component, prop] of fields) {
    assert.deepEqual(propsFor(tree, component)[prop], expected[model], `${component}.${prop}`);
  }
}

const fallbacks = Object.fromEntries(collections.map(([model, , , value]) => [model, value]));
const activeSorted = { where: { active: true }, orderBy: { sortOrder: "asc" } };
const membershipFields = collections.filter(([model]) => ["plan", "fAQ"].includes(model));

function assertDefaultContent(tree) {
  assert.equal(propsFor(tree, "HeroPinned").heroData, undefined);
  assert.equal(propsFor(tree, "HorizontalScroll").attributes, undefined);
  assert.deepEqual(propsFor(tree, "StatsCounter").stats.map((stat) => stat.value), [15000, 15, 20, 5]);
}

describe("home page database fallbacks", () => {
  it("passes database records through and preserves query filters, order and limits", async () => {
    const data = databaseResults();
    const prisma = createPrisma(data);
    const { Page, warnings } = loadPage("app/page.tsx", prisma);
    const tree = await Page();
    assertCollections(tree, data);
    assert.equal(propsFor(tree, "HeroPinned").heroData, siteContent.hero);
    assert.equal(propsFor(tree, "HorizontalScroll").attributes, siteContent.attributes);
    assert.deepEqual(propsFor(tree, "StatsCounter").stats.map((stat) => stat.value), [2400, 8, 12, 9]);
    const expectedQueries = {
      program: { ...activeSorted, take: 3 },
      trainer: activeSorted,
      testimonial: { where: { approved: true }, orderBy: { createdAt: "desc" } },
      siteContent: { where: { key: "main" } },
      plan: activeSorted,
      fAQ: activeSorted,
      galleryImage: { ...activeSorted, take: 12 },
    };
    for (const model of queryOrder) {
      const query = prisma[model][model === "siteContent" ? "findUnique" : "findMany"];
      assert.deepEqual(query.mock.calls.map((call) => call.arguments), [[expectedQueries[model]]], model);
    }
    assert.deepEqual(warnings, []);
  });

  for (const missing of [[], null, undefined]) {
    it(`uses all static collections when database lists are ${JSON.stringify(missing)}`, async () => {
      const data = Object.fromEntries(collections.map(([model]) => [model, missing]));
      const { Page, warnings } = loadPage("app/page.tsx", createPrisma({ ...data, siteContent: null }));
      const tree = await Page();
      assertCollections(tree, fallbacks);
      assertDefaultContent(tree);
      assert.deepEqual(warnings, []);
    });
  }

  for (const [model, , , fallback] of collections) {
    it(`falls back for an empty ${model} collection without replacing other database data`, async () => {
      const data = databaseResults();
      const { Page, warnings } = loadPage("app/page.tsx", createPrisma({ ...data, [model]: [] }));
      const tree = await Page();
      assertCollections(tree, { ...data, [model]: fallback });
      assert.equal(propsFor(tree, "HeroPinned").heroData, siteContent.hero);
      assert.deepEqual(warnings, []);
    });
  }

  for (const [label, record] of [
    ["missing record", null],
    ["undefined record", undefined],
    ["null content", { content: null }],
    ["missing content", {}],
    ["empty content", { content: {} }],
  ]) {
    it(`uses default site content for ${label} while retaining other database data`, async () => {
      const data = databaseResults();
      const { Page, warnings } = loadPage("app/page.tsx", createPrisma({ ...data, siteContent: record }));
      const tree = await Page();
      assertCollections(tree, data);
      assertDefaultContent(tree);
      assert.deepEqual(warnings, []);
    });
  }

  for (const failedModel of queryOrder) {
    it(`renders after ${failedModel} rejects, retaining earlier results and using remaining fallbacks`, async () => {
      const data = databaseResults();
      const error = new Error(`${failedModel} offline`);
      const prisma = createPrisma(data, { [failedModel]: error });
      const { Page, warnings } = loadPage("app/page.tsx", prisma);
      const tree = await Page();
      const failedIndex = queryOrder.indexOf(failedModel);
      const expected = Object.fromEntries(collections.map(([model, , , fallback]) => [
        model, queryOrder.indexOf(model) < failedIndex ? data[model] : fallback,
      ]));
      assertCollections(tree, expected);
      if (failedIndex > queryOrder.indexOf("siteContent")) {
        assert.equal(propsFor(tree, "HeroPinned").heroData, siteContent.hero);
      } else {
        assertDefaultContent(tree);
      }
      for (const [index, model] of queryOrder.entries()) {
        const query = prisma[model][model === "siteContent" ? "findUnique" : "findMany"];
        assert.equal(query.mock.callCount(), index <= failedIndex ? 1 : 0, model);
      }
      assert.deepEqual(warnings, [[
        "Prisma offline during build/render, using static fallbacks:", error.message,
      ]]);
    });
  }
});

describe("membership page database fallbacks", () => {
  it("renders active database plans and FAQs in sort order", async () => {
    const data = databaseResults();
    const prisma = createPrisma(data);
    const { Page, warnings } = loadPage("app/membership/page.tsx", prisma);
    assertCollections(await Page(), data, membershipFields);
    for (const model of ["plan", "fAQ"]) {
      assert.deepEqual(prisma[model].findMany.mock.calls.map((call) => call.arguments), [[activeSorted]]);
    }
    assert.deepEqual(warnings, []);
  });

  for (const missing of [[], null, undefined]) {
    it(`uses static plans and FAQs when database lists are ${JSON.stringify(missing)}`, async () => {
      const { Page, warnings } = loadPage("app/membership/page.tsx", createPrisma({ plan: missing, fAQ: missing }));
      assertCollections(await Page(), fallbacks, membershipFields);
      assert.deepEqual(warnings, []);
    });
  }

  for (const [model, , , fallback] of membershipFields) {
    it(`uses fallback ${model} data independently of the other database collection`, async () => {
      const data = databaseResults();
      const { Page, warnings } = loadPage("app/membership/page.tsx", createPrisma({ ...data, [model]: [] }));
      assertCollections(await Page(), { ...data, [model]: fallback }, membershipFields);
      assert.deepEqual(warnings, []);
    });
  }

  for (const model of ["plan", "fAQ"]) {
    it(`renders when ${model} rejects and keeps any plans already fetched`, async () => {
      const data = databaseResults();
      const error = new Error("Membership database unavailable");
      const prisma = createPrisma(data, { [model]: error });
      const { Page, warnings } = loadPage("app/membership/page.tsx", prisma);
      assertCollections(await Page(), {
        plan: model === "fAQ" ? data.plan : fallbacks.plan,
        fAQ: fallbacks.fAQ,
      }, membershipFields);
      assert.equal(prisma.plan.findMany.mock.callCount(), 1);
      assert.equal(prisma.fAQ.findMany.mock.callCount(), model === "fAQ" ? 1 : 0);
      assert.deepEqual(warnings, [[
        "Prisma offline during build/render, using static membership fallbacks:", error.message,
      ]]);
    });
  }
});

describe("gallery page database fallbacks", () => {
  const image = { id: "image", title: "Gym", imageUrl: "/gym.jpg", category: "Facilities" };
  const video = { id: "video", title: "Tour", imageUrl: "/tour.mp4", category: "Video Highlight" };

  it("retains database ordering within image and video groups after a successful query", async () => {
    const secondImage = { ...image, id: "image-2", category: "Training" };
    const secondVideo = { ...video, id: "video-2" };
    const prisma = createPrisma({ galleryImage: [video, image, secondVideo, secondImage] });
    const { Page, warnings } = loadPage("app/gallery/page.tsx", prisma);
    const props = propsFor(await Page(), "GalleryClient");
    assert.deepEqual(props.galleryItems, [image, secondImage]);
    assert.deepEqual(props.videoHighlights, [video, secondVideo]);
    assert.deepEqual(prisma.galleryImage.findMany.mock.calls.map((call) => call.arguments), [[{
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }]]);
    assert.deepEqual(warnings, []);
  });

  for (const [label, items, images, videos] of [
    ["empty gallery", [], [], []],
    ["images only", [image], [image], []],
    ["videos only", [video], [], [video]],
  ]) {
    it(`renders ${label} without warnings`, async () => {
      const { Page, warnings } = loadPage("app/gallery/page.tsx", createPrisma({ galleryImage: items }));
      const props = propsFor(await Page(), "GalleryClient");
      assert.deepEqual(props.galleryItems, images);
      assert.deepEqual(props.videoHighlights, videos);
      assert.deepEqual(warnings, []);
    });
  }

  it("renders empty image and video groups when the database rejects", async () => {
    const error = new Error("Gallery database unavailable");
    const { Page, warnings } = loadPage("app/gallery/page.tsx", createPrisma({}, { galleryImage: error }));
    const props = propsFor(await Page(), "GalleryClient");
    assert.deepEqual(props.galleryItems, []);
    assert.deepEqual(props.videoHighlights, []);
    assert.deepEqual(warnings, [[
      "Prisma offline during build/render, using empty gallery fallback:", error.message,
    ]]);
  });
});

for (const [path, firstModel, prefix, assertFallback, assertDatabase] of [
  ["app/page.tsx", "program", "Prisma offline during build/render, using static fallbacks:",
    (tree) => { assertCollections(tree, fallbacks); assertDefaultContent(tree); },
    (tree, data) => assertCollections(tree, data)],
  ["app/membership/page.tsx", "plan", "Prisma offline during build/render, using static membership fallbacks:",
    (tree) => assertCollections(tree, fallbacks, membershipFields),
    (tree, data) => assertCollections(tree, data, membershipFields)],
  ["app/gallery/page.tsx", "galleryImage", "Prisma offline during build/render, using empty gallery fallback:",
    (tree) => {
      const props = propsFor(tree, "GalleryClient");
      assert.deepEqual(props.galleryItems, []);
      assert.deepEqual(props.videoHighlights, []);
    },
    (tree, data) => {
      const props = propsFor(tree, "GalleryClient");
      assert.deepEqual(props.galleryItems, data.galleryImage);
      assert.deepEqual(props.videoHighlights, []);
    }],
]) {
  describe(`${path} failure diagnostics and recovery`, () => {
    for (const [label, rejection, diagnostic] of [
      ["string rejection", "connection refused", "connection refused"],
      ["null rejection", null, null],
      ["undefined rejection", undefined, undefined],
      ["object with a message", { message: "connection timed out" }, "connection timed out"],
      ["object with an empty message", { message: "", code: "OFFLINE" }, { message: "", code: "OFFLINE" }],
    ]) {
      it(`handles a ${label} without throwing while logging the diagnostic`, async () => {
        const { Page, warnings } = loadPage(path, createPrisma({}, { [firstModel]: rejection }));
        assertFallback(await Page());
        assert.deepEqual(warnings, [[prefix, diagnostic]]);
      });
    }

    it("uses fresh fallbacks after a successful render and recovers on the next render", async () => {
      const data = databaseResults();
      const prisma = createPrisma(data);
      prisma[firstModel].findMany.mock.mockImplementationOnce(async () => {
        throw new Error("temporary outage");
      }, 1);
      const { Page, warnings } = loadPage(path, prisma);
      assertDatabase(await Page(), data);
      assertFallback(await Page());
      assertDatabase(await Page(), data);
      assert.deepEqual(warnings, [[prefix, "temporary outage"]]);
    });
  });
}
