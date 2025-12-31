/**
 * Node.js entrypoint for Hocuspocus Server
 * This is the default entrypoint and maintains full backward compatibility
 */

// Re-export everything from the main module
export * from "../index.ts";

// Export Node-specific adapter for advanced use cases
export { NodeRuntimeAdapter } from "../adapters/node.ts";
