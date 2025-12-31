/**
 * Runtime-agnostic types for Hocuspocus server
 * 
 * This module defines interfaces that abstract away runtime-specific details,
 * allowing the core server logic to work with Web Platform APIs rather than
 * Node.js-specific types.
 */

/**
 * Runtime-agnostic WebSocket interface
 * 
 * This interface represents the minimum WebSocket API surface needed by Hocuspocus,
 * abstracting over different WebSocket implementations (Node 'ws', browser WebSocket, etc.)
 */
export interface RuntimeWebSocket {
	// WebSocket ready states
	readonly readyState: number;
	
	// Binary type for received messages
	binaryType: string;
	
	// Methods
	send(data: Uint8Array | ArrayBuffer | string, callback?: (error?: Error) => void): void;
	ping(): void;
	close(code?: number, reason?: string): void;
	
	// Event listener management (on/once/removeListener for Node, addEventListener for Web)
	on(event: string, listener: (...args: any[]) => void): void;
	once(event: string, listener: (...args: any[]) => void): void;
	removeListener(event: string, listener: (...args: any[]) => void): void;
	
	// Allow setting max listeners (Node.js specific, but optional)
	setMaxListeners?(count: number): void;
}

/**
 * Runtime-agnostic HTTP request
 * 
 * This represents an incoming HTTP request using Web Platform APIs.
 * For WebSocket upgrade requests, this contains the initial HTTP upgrade request.
 */
export interface RuntimeRequest {
	/**
	 * The request URL (may be relative like "/path?query=value")
	 */
	readonly url: string;
	
	/**
	 * Request headers as a plain object
	 * This matches the Node.js IncomingMessage.headers structure for compatibility
	 */
	readonly headers: Record<string, string | string[] | undefined>;
	
	/**
	 * HTTP method (GET, POST, etc.)
	 */
	readonly method?: string;
}

/**
 * Runtime-agnostic HTTP response
 * 
 * Minimal interface for sending HTTP responses
 */
export interface RuntimeResponse {
	/**
	 * Set the HTTP status code
	 */
	writeHead(statusCode: number, headers?: Record<string, string>): void;
	
	/**
	 * Write response data
	 */
	write(chunk: string | Uint8Array): void;
	
	/**
	 * End the response
	 */
	end(chunk?: string | Uint8Array): void;
}
