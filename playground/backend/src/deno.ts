import { Hocuspocus } from "@hocuspocus/server";
import { Logger } from "@hocuspocus/extension-logger";

const hocuspocus = new Hocuspocus({
	name: "hocuspocus-deno",
	extensions: [
		// Logger is runtime-agnostic and works on Deno
		new Logger(),
	],
});

// @ts-ignore - Deno types
Deno.serve({ port: 8000 }, (req) => {
	const upgradeHeader = req.headers.get("upgrade");

	if (upgradeHeader !== "websocket") {
		const message = "Hocuspocus on Deno! Use WebSocket to connect.";
		return new Response(message, {
			status: 200,
			headers: { "Content-Type": "text/plain" },
		});
	}

	// @ts-ignore - Deno WebSocket API
	const { socket, response } = Deno.upgradeWebSocket(req);

	// @ts-ignore
	socket.addEventListener("open", (_event) => {
		// @ts-ignore
		hocuspocus.handleConnection(socket, req);
	});

	return response;
});

console.log("Hocuspocus server is running on Deno at ws://127.0.0.1:8000");
