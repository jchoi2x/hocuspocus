/**
 * Bun Runtime Adapter
 * Provides Bun-specific implementations of runtime abstractions
 * 
 * Bun is largely compatible with Node.js APIs, so this adapter
 * extends the Node adapter with any Bun-specific optimizations
 */

import { NodeRuntimeAdapter } from "./node.ts";

/**
 * Bun runtime adapter implementation
 * Since Bun aims for Node.js compatibility, we can reuse most of the Node adapter
 */
export class BunRuntimeAdapter extends NodeRuntimeAdapter {
	name = "bun";

	// Bun has native crypto.randomUUID support
	randomUUID(): string {
		return crypto.randomUUID();
	}

	// Note: Bun also has its own optimized WebSocket implementation
	// If needed in the future, we can override normalizeWebSocket to use Bun's native WebSocket
}
