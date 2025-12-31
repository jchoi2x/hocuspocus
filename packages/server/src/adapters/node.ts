/**
 * Node.js Runtime Adapter
 * Provides Node.js-specific implementations of runtime abstractions
 */

import crypto from "node:crypto";
import type { RuntimeAdapter, TimerHandle, WebSocketLike } from "../core/interfaces.ts";

/**
 * Node.js runtime adapter implementation
 */
export class NodeRuntimeAdapter implements RuntimeAdapter {
	name = "node";

	timers = {
		setTimeout: (callback: () => void, delay: number): TimerHandle => {
			return setTimeout(callback, delay);
		},
		clearTimeout: (handle: TimerHandle): void => {
			clearTimeout(handle as NodeJS.Timeout);
		},
		setInterval: (callback: () => void, delay: number): TimerHandle => {
			return setInterval(callback, delay);
		},
		clearInterval: (handle: TimerHandle): void => {
			clearInterval(handle as NodeJS.Timeout);
		},
	};

	normalizeWebSocket(socket: any): WebSocketLike {
		// Node.js WebSocket from 'ws' package already matches our interface closely
		return socket as WebSocketLike;
	}

	normalizeRequest(request: any): import("../core/interfaces.ts").RequestLike {
		// Node.js IncomingMessage
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
