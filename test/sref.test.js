import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSref } from '../src/sref.js';

test('parse versioned SREF', () => {
  const parsed = parseSref('gitwho:eng/debugger@0.1.0');
  assert.equal(parsed.type, 'versioned');
  assert.equal(parsed.handle, 'eng');
  assert.equal(parsed.name, 'debugger');
  assert.equal(parsed.version, '0.1.0');
  assert.equal(parsed.id, 'gitwho:eng/debugger');
});

test('parse hashed SREF', () => {
  const parsed = parseSref('gitwho:eng/debugger#sha256:deadbeef');
  assert.equal(parsed.type, 'hashed');
  assert.equal(parsed.hash, 'deadbeef');
});

test('reject invalid SREF', () => {
  assert.throws(() => parseSref('gitwho:eng/debugger'));
});
