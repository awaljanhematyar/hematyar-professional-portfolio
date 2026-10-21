import assert from "node:assert/strict";
import { test } from "node:test";
import { atelierNorth, includeAtelierNorth } from "./atelierNorth.js";

test("adds the verified case study without changing existing projects or their order", () => {
  const existing = [{ id: "existing-1", slug: "existing-project", title: "Existing project" }];
  const result = includeAtelierNorth(existing);
  assert.equal(existing.length, 1);
  assert.equal(result.length, 2);
  assert.equal(result[0], existing[0]);
  assert.equal(result[1], atelierNorth);
});

test("uses the published CMS version instead of duplicating the same slug", () => {
  const cmsProject = { ...atelierNorth, id: "cms-owned-record", title: "CMS title" };
  const published = [cmsProject];
  assert.equal(includeAtelierNorth(published), published);
  assert.equal(includeAtelierNorth(published)[0], cmsProject);
});

test("includes the case study in preview and empty CMS states", () => {
  assert.deepEqual(includeAtelierNorth(), [atelierNorth]);
  assert.deepEqual(includeAtelierNorth(null), [atelierNorth]);
});

test("provides the requested category, stack, actual live origin and source links", () => {
  assert.equal(atelierNorth.category, "Premium Interior Design Website");
  assert.deepEqual(atelierNorth.technologies, ["React", "Vite", "Tailwind CSS", "React Router"]);
  assert.equal(atelierNorth.live_url, "https://atelier-north-interiors.vercel.app");
  assert.equal(atelierNorth.github_url, "https://github.com/awaljanhematyar/atelier-north-interiors");
  assert.match(atelierNorth.description, /fictional/);
  assert.match(atelierNorth.description, /local-only/);
});
