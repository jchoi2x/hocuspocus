/**
 * Runtime-agnostic interfaces for cross-runtime compatibility.
 * These interfaces abstract platform-specific details to allow the core
 * Hocuspocus logic to work across Node.js, Bun, Deno, and Cloudflare Workers.
 */

/**
 * Web-standard like WebSocket interface that abstracts runtime differences
 */
export interface WebSocketLike {
	/**
	 * The ready state of the WebSocket connection
	 */
	readyState: number;

	/**
	 * Binary type for the WebSocket
	 */
	binaryType?: string;

	/**
	 * Send data through the WebSocket
	 */
	send(data: Uint8Array | ArrayBuffer | string, callback?: (error?: Error) => void): void;

	/**
	 * Close the WebSocket connection
	 */
	close(code?: number, reason?: string): void;

	/**
	 * Add an event listener
	 */
	on?(event: string, listener: (...args: any[]) => void): void;
	addEventListener?(event: string, listener: (...args: any[]) => void): void;

	/**
	 * Remove an event listener
	 */
	off?(event: string, listener: (...args: any[]) => void): void;
	removeEventListener?(event: string, listener: (...args: any[]) => void): void;

	/**
	 * One-time event listener
	 */
	once?(event: string, listener: (...args: any[]) => void): void;

	/**
	 * Ping the connection (Node/ws specific)
	 */
	ping?(): void;

	/**
	 * Set max listeners (Node EventEmitter specific)
	 */
	setMaxListeners?(n: number): void;
}

/**
 * HTTP request-like interface abstracting runtime differences
 */
export interface RequestLike {
	/**
	 * Request URL
	 */
	url?: string;

	/**
	 * Request headers
	 */
	headers?: Record<string, string | string[] | undefined>;

	/**
	 * Request method
	 */
	method?: string;
}

/**
 * Timer handle that works across runtimes
 */
export type TimerHandle = ReturnType<typeof setTimeout> | number;

/**
 * Runtime-agnostic timer functions
 */
export interface RuntimeTimers {
	setTimeout(callback: () => void, delay: number): TimerHandle;
	clearTimeout(handle: TimerHandle): void;
	setInterval(callback: () => void, delay: number): TimerHandle;
	clearInterval(handle: TimerHandle): void;
}

/**
 * Runtime adapter interface for platform-specific implementations
 */
export interface RuntimeAdapter<Env = unknown> {
	/**
	 * Name of the runtime (for debugging/logging)
	 */
	name: string;

	/**
	 * Timer functions for the runtime
	 */
	timers: RuntimeTimers;

	/**
	 * Normalize a WebSocket instance to the WebSocketLike interface
	 */
	normalizeWebSocket(socket: any): WebSocketLike;

	/**
	 * Normalize a request to the RequestLike interface
	 */
	normalizeRequest(request: any): RequestLike;

	/**
	 * Generate a random UUID
	 */
	randomUUID(): string;
}
