/**
 * Simple smoke test to verify runtime entrypoints can be imported
 * and basic functionality works.
 */

const path = require('path');
const assert = require('assert');

console.log('Testing multi-runtime entrypoints...\n');

// Test 1: Main entry (default - Node.js)
console.log('1. Testing main entry (default Node.js)...');
const main = require(path.join(__dirname, 'dist/hocuspocus-server.cjs'));
assert(typeof main.Server === 'function', 'Server should be a function');
assert(typeof main.Hocuspocus === 'function', 'Hocuspocus should be a function');
assert(typeof main.Document === 'function', 'Document should be exported');
console.log('   ✓ Main entry works\n');

// Test 2: Node.js explicit entry
console.log('2. Testing Node.js explicit entry...');
const nodeEntry = require(path.join(__dirname, 'dist/entries/node.cjs'));
assert(typeof nodeEntry.Server === 'function', 'Server should be a function');
assert(typeof nodeEntry.Hocuspocus === 'function', 'Hocuspocus should be a function');
assert(typeof nodeEntry.NodeRuntimeAdapter === 'function', 'NodeRuntimeAdapter should be exported');
console.log('   ✓ Node entry works\n');

// Test 3: Bun entry
console.log('3. Testing Bun entry...');
const bunEntry = require(path.join(__dirname, 'dist/entries/bun.cjs'));
assert(typeof bunEntry.Server === 'function', 'Server should be a function');
assert(typeof bunEntry.Hocuspocus === 'function', 'Hocuspocus should be a function');
assert(typeof bunEntry.BunRuntimeAdapter === 'function', 'BunRuntimeAdapter should be exported');
console.log('   ✓ Bun entry works\n');

// Test 4: Verify Hocuspocus can be instantiated
console.log('4. Testing Hocuspocus instantiation...');
const { Hocuspocus } = main;
const hocuspocus = new Hocuspocus({
  name: 'test-instance',
  quiet: true,
});
assert(hocuspocus.configuration.name === 'test-instance', 'Configuration should be applied');
assert(hocuspocus.documents instanceof Map, 'Documents map should exist');
console.log('   ✓ Hocuspocus instantiation works\n');

// Test 5: Verify Server can be instantiated
console.log('5. Testing Server instantiation...');
const { Server } = main;
const server = new Server({
  name: 'test-server',
  quiet: true,
  port: 0, // Use port 0 to avoid conflicts
});
assert(server.hocuspocus instanceof Hocuspocus, 'Server should have hocuspocus instance');
assert(server.configuration.name === 'test-server', 'Server configuration should be applied');
console.log('   ✓ Server instantiation works\n');

console.log('✅ All smoke tests passed!');
