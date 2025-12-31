/**
 * Base Hocuspocus Durable Object for Cloudflare Workers
 * 
 * This class provides a base implementation for using Hocuspocus with Cloudflare Workers
 * Durable Objects and the hibernatable WebSocket API.
 * 
 * Usage:
 * ```typescript
 * import { BaseHocuspocusDurableObject } from "@hocuspocus/server/cloudflare-workers";
 * 
 * export class MyHocuspocusDurableObject extends BaseHocuspocusDurableObject {
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
 */

import { Hocuspocus, defaultConfiguration } from "../Hocuspocus.ts";
import type { Configuration } from "../types.ts";

/**
 * WebSocket wrapper that adds EventEmitter-like interface for Cloudflare Workers
 */
class HibernatableWebSocket {
	private ws: WebSocket;
	private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

	constructor(ws: WebSocket) {
		this.ws = ws;
	}

	get readyState() {
		return this.ws.readyState;
	}

	get binaryType() {
		return "nodebuffer";
	}

	send(data: Uint8Array | ArrayBuffer | string, callback?: (error?: Error) => void) {
		try {
			this.ws.send(data);
			callback?.();
		} catch (error) {
			callback?.(error as Error);
		}
	}

	close(code?: number, reason?: string) {
		this.ws.close(code, reason);
	}

	/**
	 * EventEmitter-style on() method
	 */
	on(event: string, listener: (...args: any[]) => void) {
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		this.listeners.get(event)!.add(listener);
	}

	/**
	 * EventEmitter-style once() method
	 */
	once(event: string, listener: (...args: any[]) => void) {
		const onceWrapper = (...args: any[]) => {
			listener(...args);
			this.off(event, onceWrapper);
		};
		this.on(event, onceWrapper);
	}

	/**
	 * EventEmitter-style off() method
	 */
	off(event: string, listener: (...args: any[]) => void) {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.delete(listener);
		}
	}

	/**
	 * EventEmitter-style emit() method
	 */
	emit(event: string, ...args: any[]) {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.forEach((listener) => {
				try {
					listener(...args);
				} catch (error) {
					console.error(`Error in ${event} listener:`, error);
				}
			});
		}
	}

	/**
	 * Ping is a no-op for Cloudflare Workers (hibernation handles this)
	 */
	ping() {
		// No-op: Cloudflare Workers handles WebSocket keepalive automatically
	}

	/**
	 * setMaxListeners is a no-op (EventEmitter compatibility)
	 */
	setMaxListeners(n: number) {
		// No-op: Not needed for our implementation
	}

	/**
	 * Get the raw WebSocket for internal use
	 */
	getRawWebSocket(): WebSocket {
		return this.ws;
	}
}

/**
 * Base Durable Object class for Hocuspocus with hibernatable WebSocket support
 */
export abstract class BaseHocuspocusDurableObject {
	protected ctx: DurableObjectState;
	protected env: any;
	protected hocuspocus: Hocuspocus;
	private wsMap: Map<WebSocket, HibernatableWebSocket> = new Map();

	constructor(state: DurableObjectState, env: any, config?: Partial<Configuration>) {
		this.ctx = state;
		this.env = env;

		// Initialize Hocuspocus with the provided configuration
		this.hocuspocus = new Hocuspocus({
			...defaultConfiguration,
			...config,
		});
	}

	/**
	 * Handle incoming HTTP requests (WebSocket upgrades)
	 */
	async fetch(request: Request): Promise<Response> {
		const upgrade = request.headers.get("Upgrade");

		if (upgrade !== "websocket") {
			return new Response("Expected WebSocket upgrade", { status: 426 });
		}

		// Create WebSocket pair
		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		// Accept the WebSocket with hibernation support
		this.ctx.acceptWebSocket(server);

		// Wrap the server WebSocket
		const wrappedWs = new HibernatableWebSocket(server);
		this.wsMap.set(server, wrappedWs);

		// Create a minimal request-like object for Hocuspocus
		const hocuspocusRequest = {
			url: request.url,
			headers: Object.fromEntries(request.headers.entries()),
			method: request.method,
		};

		// Initialize the connection with Hocuspocus
		// @ts-ignore - handleConnection expects IncomingMessage but works with our request-like object
		this.hocuspocus.handleConnection(wrappedWs, hocuspocusRequest);

		// Return the client WebSocket to complete the upgrade
		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	}

	/**
	 * Handle incoming WebSocket messages (hibernatable API)
	 */
	async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
		const wrappedWs = this.wsMap.get(ws);
		if (!wrappedWs) {
			console.error("WebSocket not found in map");
			return;
		}

		// Convert message to Uint8Array if it's an ArrayBuffer
		const data = message instanceof ArrayBuffer ? new Uint8Array(message) : message;

		// Emit the message event to trigger Hocuspocus message handling
		wrappedWs.emit("message", data);
	}

	/**
	 * Handle WebSocket close events (hibernatable API)
	 */
	async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
		const wrappedWs = this.wsMap.get(ws);
		if (!wrappedWs) {
			console.error("WebSocket not found in map");
			return;
		}

		// Convert reason string to Buffer for Node.js compatibility
		const reasonBuffer = new TextEncoder().encode(reason);

		// Emit the close event to trigger Hocuspocus cleanup
		wrappedWs.emit("close", code, reasonBuffer);

		// Clean up the wrapper
		this.wsMap.delete(ws);
	}

	/**
	 * Handle WebSocket errors (hibernatable API)
	 */
	async webSocketError(ws: WebSocket, error: unknown) {
		const wrappedWs = this.wsMap.get(ws);
		if (!wrappedWs) {
			console.error("WebSocket not found in map");
			return;
		}

		// Emit the error event
		wrappedWs.emit("error", error);
	}
}
