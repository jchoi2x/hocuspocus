import { describe, it, expect } from "vitest";
import { uuid } from "../uuid";

describe("uuid", () => {
	it("should generate a valid UUID v4 format", () => {
		const result = uuid();

		// UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

		expect(result).toMatch(uuidRegex);
	});

	it("should generate unique UUIDs on multiple calls", () => {
		const uuid1 = uuid();
		const uuid2 = uuid();
		const uuid3 = uuid();

		expect(uuid1).not.toBe(uuid2);
		expect(uuid2).not.toBe(uuid3);
		expect(uuid1).not.toBe(uuid3);
	});

	it("should have correct length", () => {
		const result = uuid();

		expect(result).toHaveLength(36); // 32 hex chars + 4 dashes
	});

	it("should have dashes in correct positions", () => {
		const result = uuid();

		expect(result[8]).toBe("-");
		expect(result[13]).toBe("-");
		expect(result[18]).toBe("-");
		expect(result[23]).toBe("-");
	});

	it("should have '4' in the version position", () => {
		const result = uuid();

		// Position 14 should be '4' for version 4 UUID
		expect(result[14]).toBe("4");
	});

	it("should have correct variant bits", () => {
		const result = uuid();

		// Position 19 should be 8, 9, a, or b (variant bits)
		const variantChar = result[19];
		expect(["8", "9", "a", "b"]).toContain(variantChar.toLowerCase());
	});
});
