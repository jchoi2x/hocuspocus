/**
 * Runtime abstraction layer for platform-agnostic functionality
 * Provides interfaces for crypto, HTTP, and other runtime-specific features
 */

// Crypto interface
export interface RuntimeCrypto {
	randomUUID(): string;
}

// WebSocket interface compatible with Web Standards and ws package
export interface RuntimeWebSocket {
	// Properties
	readyState: number;
	binaryType?: string;

	// Methods
	send(data: ArrayBuffer | Uint8Array | string, callback?: (error?: Error) => void): void;
	close(code?: number, reason?: string): void;
	
	// Event handlers (Web Standards style)
	addEventListener?(type: string, listener: (event: any) => void): void;
	removeEventListener?(type: string, listener: (event: any) => void): void;
	
	// Event handlers (Node.js ws style)
	on?(event: string, listener: (...args: any[]) => void): void;
	off?(event: string, listener: (...args: any[]) => void): void;
	once?(event: string, listener: (...args: any[]) => void): void;

	// Common event properties
	onopen?: ((event: any) => void) | null;
	onclose?: ((event: any) => void) | null;
	onmessage?: ((event: any) => void) | null;
	onerror?: ((event: any) => void) | null;
}

// HTTP Request interface (Web Standards compatible)
export interface RuntimeRequest {
	url?: string;
	headers?: Map<string, string> | Headers | Record<string, string>;
	method?: string;
}

// Generic parameter interface
export interface RuntimeParameters {
	get(name: string): string | null;
	getAll(name: string): string[];
	has(name: string): boolean;
}

/**
 * Default implementations using Web Standards APIs
 */

export class WebStandardsCrypto implements RuntimeCrypto {
	randomUUID(): string {
		// Try crypto.randomUUID first (available in Node 19+, Deno, Bun, CF Workers)
		if (typeof crypto !== "undefined" && crypto.randomUUID) {
			return crypto.randomUUID();
		}

		// Fallback for older environments
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}
}

export class WebStandardsParameters implements RuntimeParameters {
	private params: URLSearchParams;

	constructor(params: URLSearchParams | string) {
		this.params =
			typeof params === "string" ? new URLSearchParams(params) : params;
	}

	get(name: string): string | null {
		return this.params.get(name);
	}

	getAll(name: string): string[] {
		return this.params.getAll(name);
	}

	has(name: string): boolean {
		return this.params.has(name);
	}
}

/**
 * Default runtime implementations (Web Standards)
 */
export const defaultRuntimeCrypto: RuntimeCrypto = new WebStandardsCrypto();

/**
 * Helper to convert various header formats to a unified format
 */
export function normalizeHeaders(
	headers:
		| Map<string, string>
		| Headers
		| Record<string, string | string[]>
		| undefined,
): Map<string, string> {
	const normalized = new Map<string, string>();

	if (!headers) {
		return normalized;
	}

	if (headers instanceof Map) {
		return headers;
	}

	if (headers instanceof Headers) {
		headers.forEach((value, key) => {
			normalized.set(key.toLowerCase(), value);
		});
		return normalized;
	}

	// Plain object
	for (const [key, value] of Object.entries(headers)) {
		if (Array.isArray(value)) {
			normalized.set(key.toLowerCase(), value[0] || "");
		} else {
			normalized.set(key.toLowerCase(), value);
		}
	}

	return normalized;
}

/**
 * Helper to extract query parameters from a request
 */
export function getParametersFromRequest(
	request: RuntimeRequest,
): RuntimeParameters {
	const url = request.url || "";
	const queryStart = url.indexOf("?");

	if (queryStart === -1) {
		return new WebStandardsParameters("");
	}

	const queryString = url.substring(queryStart + 1);
	return new WebStandardsParameters(queryString);
}

/**
 * Helper to normalize WebSocket event listeners across different implementations
 */
export function addWebSocketListener(
	ws: RuntimeWebSocket,
	event: string,
	handler: (event: any) => void,
): void {
	if (ws.addEventListener) {
		ws.addEventListener(event, handler);
	} else if (ws.on) {
		ws.on(event, handler);
	}
}

export function removeWebSocketListener(
	ws: RuntimeWebSocket,
	event: string,
	handler: (event: any) => void,
): void {
	if (ws.removeEventListener) {
		ws.removeEventListener(event, handler);
	} else if (ws.off) {
		ws.off(event, handler);
	}
}
