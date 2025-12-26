# Runtime Support

Hocuspocus is **runtime agnostic** and works seamlessly across multiple JavaScript runtimes including Node.js, Deno, Bun, and Cloudflare Workers.

## Import Paths

Hocuspocus now provides multiple import paths for different use cases:

```typescript
// Default: Everything (backward compatible, includes Node.js Server class)
import { Hocuspocus, Server } from '@hocuspocus/server'

// Core: Runtime-agnostic core only (recommended for non-Node.js runtimes)
import { Hocuspocus } from '@hocuspocus/server/core'

// Node: Everything including Node.js Server class (explicit Node.js usage)
import { Hocuspocus, Server } from '@hocuspocus/server/node'

// Runtime: Just the runtime abstraction utilities
import { defaultRuntimeCrypto } from '@hocuspocus/server/runtime'
```

## Architecture

Hocuspocus follows a similar approach to [Hono](https://hono.dev) with a runtime-agnostic core:

- **`Hocuspocus` class**: Runtime-agnostic collaboration engine (no Node.js dependencies)
- **`Server` class**: Node.js-specific convenience wrapper (optional)
- **Runtime abstraction**: Web Standards-based APIs that work across all runtimes

## Quick Start by Runtime

### Node.js

#### Using the Server class (recommended for standalone)

**Installation:**
```bash
npm install ws @hocuspocus/server
```

**Note:** The `ws` package is required for the Node.js `Server` class but is not automatically installed. Install it separately.

```typescript
import { Server } from '@hocuspocus/server'

const server = new Server({
  port: 1234,
})

server.listen()
```

#### Using Hocuspocus with Express

```typescript
import { Hocuspocus } from '@hocuspocus/server'
import express from 'express'
import expressWebsockets from 'express-ws'

const hocuspocus = new Hocuspocus()
const { app } = expressWebsockets(express())

app.ws('/collaboration', (websocket, request) => {
  hocuspocus.handleConnection(websocket, request)
})

app.listen(1234)
```

#### Using Hocuspocus with Hono on Node.js

```typescript
import { Hocuspocus } from '@hocuspocus/server'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { createNodeWebSocket } from '@hono/node-ws'

const hocuspocus = new Hocuspocus()
const app = new Hono()

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

app.get('/collaboration', upgradeWebSocket((c) => ({
  onOpen(_evt, ws) {
    hocuspocus.handleConnection(ws.raw, c.req.raw, {})
  },
})))

const server = serve({ fetch: app.fetch, port: 1234 })
injectWebSocket(server)
```

### Deno

```typescript
import { Hocuspocus } from '@hocuspocus/server/core'

const hocuspocus = new Hocuspocus()

Deno.serve((req) => {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426 })
  }

  const { socket, response } = Deno.upgradeWebSocket(req)
  
  socket.addEventListener('open', () => {
    hocuspocus.handleConnection(socket, req)
  })

  return response
})
```

### Bun

```typescript
import { Hocuspocus } from '@hocuspocus/server/core'

const hocuspocus = new Hocuspocus()

Bun.serve({
  port: 1234,
  fetch(req, server) {
    if (server.upgrade(req)) {
      return
    }
    return new Response('Expected WebSocket', { status: 426 })
  },
  websocket: {
    open(ws) {
      // Bun's WebSocket is compatible
      hocuspocus.handleConnection(ws, ws.data.req)
    },
    message(ws, message) {
      // Messages are handled internally by Hocuspocus
    }
  }
})
```

### Cloudflare Workers

```typescript
import { Hocuspocus } from '@hocuspocus/server/core'

export default {
  async fetch(request, env) {
    const upgradeHeader = request.headers.get('Upgrade')
    if (upgradeHeader !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 })
    }

    const hocuspocus = new Hocuspocus()
    const webSocketPair = new WebSocketPair()
    const [client, server] = Object.values(webSocketPair)

    server.accept()
    hocuspocus.handleConnection(server, request)

    return new Response(null, {
      status: 101,
      webSocket: client,
    })
  },
}
```

### Hono (Universal)

Hono works across all runtimes. Here's a runtime-agnostic example:

```typescript
import { Hocuspocus } from '@hocuspocus/server/core'
import { Hono } from 'hono'

const hocuspocus = new Hocuspocus()
const app = new Hono()

// This code works on Node.js, Deno, Bun, and Cloudflare Workers!
app.get('/collaboration', (c) => {
  const upgradeHeader = c.req.header('Upgrade')
  if (upgradeHeader !== 'websocket') {
    return c.text('Expected WebSocket', 426)
  }
  
  // Runtime-specific WebSocket upgrade happens here
  // See runtime-specific examples above for details
})

export default app
```

## WebSocket Interface

The `Hocuspocus` class expects a WebSocket-like interface with:

- `send(data: ArrayBuffer | Uint8Array, callback?: (error?: Error) => void): void`
- `close(code?: number, reason?: string): void`
- `readyState: number` (0 = CONNECTING, 1 = OPEN, 2 = CLOSING, 3 = CLOSED)
- `binaryType?: string` (optional, will be set to "nodebuffer" for Node.js)
- `addEventListener` or `on` for message/close events

Most WebSocket implementations across runtimes are compatible out of the box.

## Request Interface

The second parameter to `handleConnection` can be any request-like object. Hocuspocus extracts:

- `url` or `path` - To determine document name
- `headers` - For authentication and metadata
- Any custom properties you pass in the third `context` parameter

## Extensions and Runtime Compatibility

Most Hocuspocus extensions are runtime-agnostic, but some have runtime-specific dependencies:

### ✅ Runtime-Agnostic Extensions
- `@hocuspocus/extension-logger`
- `@hocuspocus/extension-throttle`
- `@hocuspocus/transformer`

### ⚠️ Node.js-Specific Extensions  
- `@hocuspocus/extension-sqlite` (uses native SQLite)
- `@hocuspocus/extension-redis` (uses ioredis)
- `@hocuspocus/extension-s3` (uses AWS SDK)
- `@hocuspocus/extension-database` (uses Node.js database drivers)

For non-Node.js runtimes, you can:
1. Use Cloudflare D1, Deno KV, or other runtime-native storage
2. Implement custom extensions using runtime-specific APIs
3. Use HTTP-based storage backends (compatible across all runtimes)

## Examples

Complete working examples for each runtime can be found in:
- [`playground/backend/src/`](./playground/backend/src/) - Various integration examples
- Node.js: `default.ts`, `express.ts`, `koa.ts`  
- Hono: `hono.ts`
- Deno: `deno.ts`

## Contributing Runtime Support

To add support for a new runtime:

1. Ensure the runtime has a WebSocket API (or adapter)
2. Create an example in `playground/backend/src/`
3. Update this documentation
4. Test that basic collaboration works

## Migration Guide

If you're currently using the Node.js-specific `Server` class and want to use Hocuspocus on other runtimes:

### Before (Node.js only):
```typescript
import { Server } from '@hocuspocus/server'
const server = new Server({ port: 1234 })
server.listen()
```

### After (Runtime agnostic):
```typescript
import { Hocuspocus } from '@hocuspocus/server'

// Use your runtime's server (Deno.serve, Bun.serve, etc.)
const hocuspocus = new Hocuspocus()
// ... integrate with your runtime's HTTP/WebSocket server
```

The `Server` class is still available and recommended for standalone Node.js applications!
