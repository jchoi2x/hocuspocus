import type { RequestLike } from "./interfaces.ts";

/**
 * Get parameters by the given request
 * Runtime-agnostic version that works with RequestLike interface
 */
export function getParameters(request?: RequestLike): URLSearchParams {
	const query = request?.url?.split("?") || [];
	return new URLSearchParams(query[1] ? query[1] : "");
}
