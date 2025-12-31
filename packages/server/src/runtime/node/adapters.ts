/**
 * Node.js runtime adapters
 * 
 * This module provides adapters to convert Node.js-specific types (IncomingMessage, ServerResponse, ws WebSocket)
 * into runtime-agnostic interfaces.
 */

import type { IncomingMessage, ServerResponse } from "node:http";
import type WebSocket from "ws";
import type { RuntimeRequest, RuntimeResponse, RuntimeWebSocket } from "../types.ts";

/**
 * Convert Node.js IncomingMessage to RuntimeRequest
 */
export function nodeRequestToRuntimeRequest(
	req: IncomingMessage,
): RuntimeRequest {
	return {
		url: req.url || "/",
		headers: req.headers,
		method: req.method,
	};
}

/**
 * Create a RuntimeRequest from a partial IncomingMessage
 * (used when we only have headers and url)
 */
export function partialNodeRequestToRuntimeRequest(
	req: Partial<Pick<IncomingMessage, "headers" | "url">>,
): RuntimeRequest {
	return {
		url: req.url || "/",
		headers: req.headers || {},
		method: undefined,
	};
}

/**
 * Adapter class that wraps a Node.js ServerResponse to implement RuntimeResponse
 */
export class NodeResponseAdapter implements RuntimeResponse {
	constructor(private readonly res: ServerResponse) {}

	writeHead(statusCode: number, headers?: Record<string, string>): void {
		this.res.writeHead(statusCode, headers);
	}

	write(chunk: string | Uint8Array): void {
		this.res.write(chunk);
	}

	end(chunk?: string | Uint8Array): void {
		this.res.end(chunk);
	}
}

/**
 * Adapter class that wraps a Node.js 'ws' WebSocket to implement RuntimeWebSocket
 * 
 * Since the Node 'ws' library already uses the event emitter pattern with
 * on/once/removeListener, and has the same methods (send, ping, close),
 * we can directly use it. This adapter primarily exists for type safety.
 */
export class NodeWebSocketAdapter implements RuntimeWebSocket {
	constructor(private readonly ws: WebSocket) {}

	get readyState(): number {
		return this.ws.readyState;
	}

	get binaryType(): string {
		return this.ws.binaryType;
	}

	set binaryType(type: string) {
		this.ws.binaryType = type as any;
	}

	send(
		data: Uint8Array | ArrayBuffer | string,
		callback?: (error?: Error) => void,
	): void {
		this.ws.send(data, callback);
	}

	ping(): void {
		this.ws.ping();
	}

	close(code?: number, reason?: string): void {
		this.ws.close(code, reason);
	}

	on(event: string, listener: (...args: any[]) => void): void {
		this.ws.on(event, listener);
	}

	once(event: string, listener: (...args: any[]) => void): void {
		this.ws.once(event, listener);
	}

	removeListener(event: string, listener: (...args: any[]) => void): void {
		this.ws.removeListener(event, listener);
	}

	setMaxListeners(count: number): void {
		this.ws.setMaxListeners(count);
	}
}

/**
 * Helper to convert Node.js IncomingMessage to a simpler request representation
 * suitable for internal use. Returns only the parts we actually use.
 */
export function extractRequestInfo(req: IncomingMessage): {
	url: string;
	headers: Record<string, string | string[] | undefined>;
} {
	return {
		url: req.url || "/",
		headers: req.headers,
	};
}
