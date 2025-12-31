/**
 * Cloudflare Workers / Durable Objects entrypoint for Hocuspocus Server
 * 
 * This entrypoint provides a Cloudflare Workers-compatible version of Hocuspocus Server.
 * It's designed to work with Durable Objects for distributed collaboration.
 * 
 * Usage in Cloudflare Workers:
 * ```typescript
 * import { Hocuspocus } from "@hocuspocus/server/cloudflare-workers";
 * 
 * export class HocuspocusDurableObject {
 *   state: DurableObjectState;
 *   hocuspocus: Hocuspocus;
 *   
 *   constructor(state: DurableObjectState, env: Env) {
 *     this.state = state;
 *     this.hocuspocus = new Hocuspocus({
 *       // ... your configuration
 *     });
 *   }
 *   
 *   async fetch(request: Request) {
 *     const upgrade = request.headers.get("Upgrade");
 *     if (upgrade === "websocket") {
 *       const pair = new WebSocketPair();
 *       const [client, server] = Object.values(pair);
 *       
 *       this.state.acceptWebSocket(server);
 *       this.hocuspocus.handleConnection(server, request);
 *       
 *       return new Response(null, { status: 101, webSocket: client });
 *     }
 *     
 *     return new Response("Hocuspocus Server", { status: 200 });
 *   }
 * }
 * ```
 */

// Re-export core functionality that works across runtimes
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
// Cloudflare Workers users should use Hocuspocus class directly with Durable Objects
