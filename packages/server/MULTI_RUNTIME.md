# Multi-Runtime Support

The `@hocuspocus/server` package now supports multiple JavaScript runtimes through dedicated entrypoints:

- **Node.js** (default)
- **Bun**
- **Deno**
- **Cloudflare Workers** (with Durable Objects)

## Usage by Runtime

### Node.js (Default)

The default import continues to work as before for Node.js:

```typescript
import { Server } from "@hocuspocus/server";

const server = Server.configure({
  port: 1234,
  // ... your configuration
});

server.listen();
```

Alternatively, you can explicitly use the Node.js entrypoint:

```typescript
import { Server } from "@hocuspocus/server/node";
```

### Bun

Bun is largely compatible with Node.js, so you can use the same API:

```typescript
import { Server } from "@hocuspocus/server/bun";

const server = Server.configure({
  port: 1234,
  // ... your configuration
});

server.listen();
```

### Deno

For Deno, use the `Hocuspocus` class directly with `Deno.serve`:

```typescript
import { Hocuspocus } from "npm:@hocuspocus/server/deno";

const hocuspocus = new Hocuspocus({
  // ... your configuration
});

Deno.serve({ port: 1234 }, (request) => {
  const upgrade = request.headers.get("upgrade");
  
  if (upgrade === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(request);
    hocuspocus.handleConnection(socket, request);
    return response;
  }
  
  return new Response("Hocuspocus Server", { status: 200 });
});
```

### Cloudflare Workers (Durable Objects)

For Cloudflare Workers with Durable Objects, use the `BaseHocuspocusDurableObject` class which implements the hibernatable WebSocket API:

```typescript
import { BaseHocuspocusDurableObject } from "@hocuspocus/server/cloudflare-workers";
import * as Y from "yjs";

export class HocuspocusDurableObject extends BaseHocuspocusDurableObject {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env, {
      // Your Hocuspocus configuration
      onLoadDocument: async ({ documentName }) => {
        // Load from Durable Object storage
        const data = await this.ctx.storage.get(documentName);
        return data ? new Uint8Array(data as ArrayBuffer) : undefined;
      },
      onStoreDocument: async ({ documentName, document }) => {
        // Save to Durable Object storage
        const state = Y.encodeStateAsUpdate(document);
        await this.ctx.storage.put(documentName, state);
      },
    });
  }
}
```

The `BaseHocuspocusDurableObject` class:
- Extends Cloudflare's `DurableObject` interface
- Implements `webSocketMessage`, `webSocketClose`, and `webSocketError` methods for hibernatable WebSocket support
- Wraps WebSockets with an EventEmitter-compatible interface for Hocuspocus
- Handles the complete WebSocket lifecycle automatically


## Architecture

The multi-runtime support is achieved through:

1. **Runtime Adapters**: Each runtime has an adapter in `src/adapters/` that implements runtime-specific functionality (timers, WebSocket normalization, etc.).

2. **Runtime-Agnostic Core**: Shared logic in `src/core/` that works across all runtimes using Web Platform APIs.

3. **Runtime-Specific Entrypoints**: Each runtime has a dedicated entrypoint in `src/entries/` that exports the appropriate APIs for that runtime.

4. **Conditional Exports**: The `package.json` uses conditional exports to automatically provide the right entrypoint based on the import path.

## Migration Guide

### For Existing Node.js Users

No changes required! The default import continues to work exactly as before. All existing code remains compatible.

### For New Runtime Users

1. Import from the appropriate entrypoint for your runtime
2. For non-Node runtimes, use the `Hocuspocus` class directly (the `Server` class is Node-specific)
3. Integrate with your runtime's WebSocket handling mechanism

## Development

### Building for Multiple Runtimes

The build process automatically generates separate bundles for each runtime:

```bash
npm run build:packages
```

This creates:
- `dist/hocuspocus-server.esm.js` and `.cjs` (main Node.js entry)
- `dist/entries/node.esm.js` and `.cjs` (explicit Node.js entry)
- `dist/entries/bun.esm.js` and `.cjs` (Bun entry)
- `dist/entries/deno.esm.js` (Deno entry, ESM only)
- `dist/entries/cloudflare-workers.esm.js` (Cloudflare Workers entry, ESM only)

### Runtime Adapter Interface

To add support for a new runtime, implement the `RuntimeAdapter` interface:

```typescript
interface RuntimeAdapter {
  name: string;
  timers: RuntimeTimers;
  normalizeWebSocket(socket: any): WebSocketLike;
  normalizeRequest(request: any): RequestLike;
  randomUUID(): string;
}
```

See `src/core/interfaces.ts` for the full interface definitions.
