import { Hocuspocus } from "@hocuspocus/server/core";
import { Logger } from "@hocuspocus/extension-logger";

const hocuspocus = new Hocuspocus({
	name: "hocuspocus-bun",
	extensions: [new Logger()],
});

// @ts-ignore - Bun types
Bun.serve({
	port: 8000,
	fetch(req, server) {
		// Check if this is a WebSocket upgrade request
		if (req.headers.get("upgrade") === "websocket") {
			// Upgrade the request to a WebSocket
			const success = server.upgrade(req, {
				data: { req }, // Store request for later use
			});

			if (success) {
				// The upgrade was successful, return undefined
				return undefined;
			}

			// Upgrade failed
			return new Response("WebSocket upgrade failed", { status: 500 });
		}

		// Regular HTTP request
		return new Response("Hocuspocus on Bun! Use WebSocket to connect.", {
			headers: { "Content-Type": "text/plain" },
		});
	},
	websocket: {
		open(ws) {
			// @ts-ignore
			const req = ws.data.req;
			// @ts-ignore
			hocuspocus.handleConnection(ws, req);
		},
		message(_ws, _message) {
			// Messages are handled internally by Hocuspocus via event listeners
		},
		close(_ws) {
			// Close is handled by Hocuspocus
		},
	},
});

console.log("Hocuspocus server is running on Bun at ws://127.0.0.1:8000");
