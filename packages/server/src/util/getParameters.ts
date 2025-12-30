/**
 * Get parameters by the given request
 * Works with any object that has a url property
 */
export function getParameters(
	request?: { url?: string },
): URLSearchParams {
	const query = request?.url?.split("?") || [];
	return new URLSearchParams(query[1] ? query[1] : "");
}
