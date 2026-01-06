/**
 * Generate a UUID v4
 * 
 * This is a simple UUID generator that doesn't rely on any runtime-specific APIs.
 * It generates a version 4 (random) UUID according to RFC 4122.
 */
export function uuid(): string {
	let d = Date.now();

	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
	});
}
