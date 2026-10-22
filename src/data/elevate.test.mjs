// Verify the integration preserves existing records, order and CMS ownership.
import test from 'node:test';
import assert from 'node:assert/strict';
import { elevate, includeElevate } from './elevate.js';
test('appends the case study without changing existing records', () => {
  const previous = [{ slug: 'existing', title: 'Existing project' }];
  assert.deepEqual(includeElevate(previous), [previous[0], elevate]);
  assert.equal(previous.length, 1);
});
test('preserves a CMS record with the same slug', () => {
  const existing = [{ ...elevate, id: 'cms-record' }];
  assert.equal(includeElevate(existing), existing);
});
test('handles missing source records and uses the requested destinations', () => {
  assert.deepEqual(includeElevate(null), [elevate]);
  assert.equal(elevate.github_url, 'https://github.com/awaljanhematyar/elevate-performance-coaching');
  assert.equal(elevate.live_url, 'https://elevate-performance-coaching-one.vercel.app');
  assert.equal(elevate.technologies.length, 6);
});
