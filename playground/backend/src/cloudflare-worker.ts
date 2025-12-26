/**
 * Cloudflare Workers example for Hocuspocus
 * 
 * To deploy:
 * 1. Install Wrangler: npm install -g wrangler
 * 2. Login: wrangler login
 * 3. Deploy: wrangler deploy
 * 
 * Note: This example uses Cloudflare's WebSocket API
 */

import { Hocuspocus } from "@hocuspocus/server";

export default {
	async fetch(request: Request, env: any, ctx: any): Promise<Response> {
		const upgradeHeader = request.headers.get("Upgrade");

		if (upgradeHeader !== "websocket") {
			return new Response(
				"Hocuspocus on Cloudflare Workers! Use WebSocket to connect.",
				{
					status: 200,
					headers: { "Content-Type": "text/plain" },
				},
			);
		}

		// Create a WebSocket pair (client and server)
		const webSocketPair = new WebSocketPair();
		const [client, server] = Object.values(webSocketPair);

		// Accept the WebSocket connection
		server.accept();

		// Create a Hocuspocus instance
		const hocuspocus = new Hocuspocus({
			name: "hocuspocus-cloudflare",
		});

		// Handle the connection
		// @ts-ignore - Cloudflare WebSocket is compatible
		hocuspocus.handleConnection(server, request);

		// Return the client WebSocket
		return new Response(null, {
			status: 101,
			webSocket: client,
		});
	},
};
