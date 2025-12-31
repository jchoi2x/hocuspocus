/**
 * Bun entrypoint for Hocuspocus Server
 * 
 * Bun is largely compatible with Node.js, so we can reuse most of the Node implementation.
 * This entrypoint provides Bun-specific optimizations where applicable.
 * 
 * Usage in Bun:
 * ```typescript
 * import { Server } from "@hocuspocus/server/bun";
 * 
 * const server = Server.configure({
 *   port: 1234,
 *   // ... your configuration
 * });
 * 
 * server.listen();
 * ```
 */

// Re-export everything from the main module (Bun is Node-compatible)
export * from "../index.ts";

// Export Bun-specific adapter for advanced use cases
export { BunRuntimeAdapter } from "../adapters/bun.ts";
