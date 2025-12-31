/**
 * Deno entrypoint for Hocuspocus Server
 * 
 * This entrypoint provides a Deno-compatible version of Hocuspocus Server.
 * It uses Deno's native APIs and web-standard interfaces.
 * 
 * Usage in Deno:
 * ```typescript
 * import { Hocuspocus } from "npm:@hocuspocus/server/deno";
 * 
 * const hocuspocus = new Hocuspocus({
 *   // ... your configuration
 * });
 * 
 * // With Deno.serve
 * Deno.serve({ port: 1234 }, (request) => {
 *   const upgrade = request.headers.get("upgrade");
 *   if (upgrade === "websocket") {
 *     const { socket, response } = Deno.upgradeWebSocket(request);
 *     hocuspocus.handleConnection(socket, request);
 *     return response;
 *   }
 *   
 *   return new Response("Hocuspocus Server", { status: 200 });
 * });
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

// Export Deno-specific adapter
export { DenoRuntimeAdapter } from "../adapters/deno.ts";

// Note: Server class is Node-specific and not exported here
// Deno users should use Hocuspocus class directly with Deno.serve
