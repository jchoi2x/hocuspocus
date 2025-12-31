# @hocuspocus/server
[![Version](https://img.shields.io/npm/v/@hocuspocus/server.svg?label=version)](https://www.npmjs.com/package/@hocuspocus/server)
[![Downloads](https://img.shields.io/npm/dm/@hocuspocus/server.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![License](https://img.shields.io/npm/l/@hocuspocus/server.svg)](https://www.npmjs.com/package/@hocuspocus/server)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

## Introduction
Hocuspocus is an opinionated collaborative editing backend for [Tiptap](https://github.com/ueberdosis/tiptap) – based on [Y.js](https://github.com/yjs/yjs), a CRDT framework with a powerful abstraction of shared data.

## Multi-Runtime Support

Hocuspocus Server now supports multiple JavaScript runtimes out of the box:

- **Node.js** (default) - Full-featured server with HTTP and WebSocket support
- **Bun** - Fast JavaScript runtime with Node.js compatibility
- **Deno** - Secure TypeScript/JavaScript runtime
- **Cloudflare Workers** - Edge computing with Durable Objects

### Usage by Runtime

#### Node.js (Default)

```typescript
import { Server } from "@hocuspocus/server";

const server = Server.configure({
  port: 1234,
  // ... your configuration
});

server.listen();
```

#### Bun

```typescript
import { Server } from "@hocuspocus/server/bun";

const server = Server.configure({
  port: 1234,
  // ... your configuration
});

server.listen();
```

#### Deno

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

#### Cloudflare Workers

```typescript
import { BaseHocuspocusDurableObject } from "@hocuspocus/server/cloudflare-workers";
import * as Y from "yjs";

export class HocuspocusDurableObject extends BaseHocuspocusDurableObject {
  constructor(state: DurableObjectState, env: Env) {
    super(state, env, {
      // Your Hocuspocus configuration
      onLoadDocument: async ({ documentName }) => {
        const data = await this.ctx.storage.get(documentName);
        return data ? new Uint8Array(data as ArrayBuffer) : undefined;
      },
      onStoreDocument: async ({ documentName, document }) => {
        const state = Y.encodeStateAsUpdate(document);
        await this.ctx.storage.put(documentName, state);
      },
    });
  }
}
```


For more details, see [MULTI_RUNTIME.md](./MULTI_RUNTIME.md).

## Official Documentation
Documentation can be found in the [GitHub repository](https://github.com/ueberdosis/hocuspocus).

## License
Hocuspocus is open-sourced software licensed under the [MIT license](https://github.com/ueberdosis/hocuspocus/blob/main/LICENSE.md).
