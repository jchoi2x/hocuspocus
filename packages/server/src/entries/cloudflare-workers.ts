/**
 * Cloudflare Workers / Durable Objects entrypoint for Hocuspocus Server
 * 
 * This entrypoint provides a Cloudflare Workers-compatible version of Hocuspocus Server
 * with support for Durable Objects and the hibernatable WebSocket API.
 * 
 * Usage in Cloudflare Workers:
 * ```typescript
 * import { BaseHocuspocusDurableObject } from "@hocuspocus/server/cloudflare-workers";
 * import * as Y from "yjs";
 * 
 * export class HocuspocusDurableObject extends BaseHocuspocusDurableObject {
 *   constructor(state: DurableObjectState, env: Env) {
 *     super(state, env, {
 *       // Your Hocuspocus configuration
 *       onLoadDocument: async ({ documentName }) => {
 *         const data = await this.ctx.storage.get(documentName);
 *         return data ? new Uint8Array(data as ArrayBuffer) : undefined;
 *       },
 *       onStoreDocument: async ({ documentName, document }) => {
 *         const state = Y.encodeStateAsUpdate(document);
 *         await this.ctx.storage.put(documentName, state);
 *       },
 *     });
 *   }
 * }
 * ```
 * 
 * The BaseHocuspocusDurableObject class:
 * - Implements the Durable Object interface with hibernatable WebSocket support
 * - Handles webSocketMessage, webSocketClose, and webSocketError methods
 * - Wraps WebSockets to provide EventEmitter-compatible interface for Hocuspocus
 * - Manages WebSocket lifecycle and Hocuspocus integration
 */

// Export the base Durable Object class (recommended approach)
export { BaseHocuspocusDurableObject } from "../cloudflare/BaseHocuspocusDurableObject.ts";

// Re-export core functionality for advanced use cases
export { Hocuspocus, defaultConfiguration } from "../Hocuspocus.ts";
export { ClientConnection } from "../ClientConnection.ts";
export { Connection } from "../Connection.ts";
export { DirectConnection } from "../DirectConnection.ts";
export { Document } from "../Document.ts";
export { IncomingMessage } from "../IncomingMessage.ts";
export { MessageReceiver } from "../MessageReceiver.ts";
export { OutgoingMessage } from "../OutgoingMessage.ts";
export * from "../types.ts";

// Export Cloudflare Workers-specific adapter
export { CloudflareWorkersRuntimeAdapter } from "../adapters/cloudflare-workers.ts";

// Note: Server class is Node-specific and not exported here
// Cloudflare Workers users should extend BaseHocuspocusDurableObject
