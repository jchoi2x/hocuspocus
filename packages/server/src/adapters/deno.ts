/**
 * Deno Runtime Adapter
 * Provides Deno-specific implementations of runtime abstractions
 */

import type { RuntimeAdapter, TimerHandle, WebSocketLike } from "../core/interfaces.ts";

/**
 * Deno runtime adapter implementation
 */
export class DenoRuntimeAdapter implements RuntimeAdapter {
	name = "deno";

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
		// Deno's WebSocket is web-standard, so we need to normalize it to our interface
		const ws = socket as WebSocket;
		
		return {
			readyState: ws.readyState,
			binaryType: ws.binaryType,
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
		// Deno uses web-standard Request
		if (request instanceof Request) {
			const headers: Record<string, string> = {};
			request.headers.forEach((value: string, key: string) => {
				headers[key] = value;
			});
			return {
				url: request.url,
				headers,
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
