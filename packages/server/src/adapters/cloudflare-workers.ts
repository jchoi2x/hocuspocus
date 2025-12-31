/**
 * Cloudflare Workers Runtime Adapter
 * Provides Cloudflare Workers-specific implementations of runtime abstractions
 * 
 * This adapter is designed for use with Cloudflare Durable Objects,
 * which provide WebSocket hibernation and distributed state management.
 */

import type { RuntimeAdapter, TimerHandle, WebSocketLike } from "../core/interfaces.ts";

/**
 * Cloudflare Workers runtime adapter implementation
 */
export class CloudflareWorkersRuntimeAdapter implements RuntimeAdapter {
	name = "cloudflare-workers";

	timers = {
		setTimeout: (callback: () => void, delay: number): TimerHandle => {
			return setTimeout(callback, delay);
		},
		clearTimeout: (handle: TimerHandle): void => {
			clearTimeout(handle as number);
		},
		setInterval: (callback: () => void, delay: number): TimerHandle => {
			return setInterval(callback, delay);
		},
		clearInterval: (handle: TimerHandle): void => {
			clearInterval(handle as number);
		},
	};

	normalizeWebSocket(socket: any): WebSocketLike {
		// Cloudflare Workers use web-standard WebSocket
		const ws = socket as WebSocket;
		
		return {
			readyState: ws.readyState,
			send: (data: Uint8Array | ArrayBuffer | string, callback?: (error?: Error) => void) => {
				try {
					ws.send(data);
					callback?.();
				} catch (error) {
					callback?.(error as Error);
				}
			},
			close: (code?: number, reason?: string) => {
				ws.close(code, reason);
			},
			addEventListener: (event: string, listener: (...args: any[]) => void) => {
				ws.addEventListener(event, listener as EventListener);
			},
			removeEventListener: (event: string, listener: (...args: any[]) => void) => {
				ws.removeEventListener(event, listener as EventListener);
			},
		};
	}

	normalizeRequest(request: any): import("../core/interfaces.ts").RequestLike {
		// Cloudflare Workers use web-standard Request
		if (request instanceof Request) {
			return {
				url: request.url,
				headers: Object.fromEntries(request.headers.entries()),
				method: request.method,
			};
		}
		
		// Fallback for other request-like objects
		return {
			url: request.url,
			headers: request.headers,
			method: request.method,
		};
	}

	randomUUID(): string {
		return crypto.randomUUID();
	}
}
