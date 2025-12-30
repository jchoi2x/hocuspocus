/**
 * Runtime-agnostic core exports
 * This module exports only the platform-independent parts of Hocuspocus
 */

export * from "./Connection.ts";
export * from "./Document.ts";
export * from "./Hocuspocus.ts";
export * from "./IncomingMessage.ts";
export * from "./MessageReceiver.ts";
export * from "./OutgoingMessage.ts";
export * from "./types.ts";
export * from "./util/debounce.ts";
export * from "./runtime.ts";

// Note: Server is NOT exported here as it's Node.js-specific
// Import from '@hocuspocus/server/node' for Node.js Server class
