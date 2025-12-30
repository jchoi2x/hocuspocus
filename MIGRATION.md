# Migration Guide: Making Hocuspocus Runtime Agnostic

This guide explains how the changes enable Hocuspocus to run on multiple JavaScript runtimes.

## What Changed?

### Documentation
- ✅ Added comprehensive `RUNTIMES.md` guide
- ✅ Updated main `README.md` to highlight multi-runtime support
- ✅ Added runtime examples for Deno, Bun, and Cloudflare Workers
- ✅ Updated package keywords for better discoverability

### Code Structure
- ✅ **No breaking changes!** All existing code continues to work
- ✅ The `Hocuspocus` class was always runtime-agnostic
- ✅ The `Server` class remains Node.js-only (as intended)

## For Existing Users

**Nothing changes!** Your existing code continues to work exactly as before:

```typescript
// This still works!
import { Server } from '@hocuspocus/server'

const server = new Server({ port: 1234 })
server.listen()
```

## For New Multi-Runtime Users

To use Hocuspocus on Deno, Bun, or Cloudflare Workers:

### Before (Node.js only)
```typescript
import { Server } from '@hocuspocus/server'
const server = new Server({ port: 1234 })
server.listen()
```

### After (Runtime agnostic)
```typescript
import { Hocuspocus } from '@hocuspocus/server'
const hocuspocus = new Hocuspocus()

// Then integrate with your runtime's WebSocket server
// See RUNTIMES.md for complete examples
```

## Architecture

```
@hocuspocus/server
├── Hocuspocus (runtime-agnostic core)
│   ├── handleConnection() - Works with any WebSocket
│   ├── Document management
│   ├── Hook system
│   └── Extension support
│
└── Server (Node.js convenience wrapper)
    ├── Built-in HTTP server
    ├── Automatic WebSocket upgrade
    └── Wraps Hocuspocus with Node.js APIs
```

## Runtime Compatibility Matrix

| Feature | Node.js | Deno | Bun | CF Workers |
|---------|---------|------|-----|------------|
| `Hocuspocus` class | ✅ | ✅ | ✅ | ✅ |
| `Server` class | ✅ | ❌ | ❌ | ❌ |
| Core collaboration | ✅ | ✅ | ✅ | ✅ |
| WebSocket handling | ✅ | ✅ | ✅ | ✅ |
| Extension: Logger | ✅ | ✅ | ✅ | ✅ |
| Extension: Throttle | ✅ | ✅ | ✅ | ✅ |
| Extension: SQLite | ✅ | ⚠️* | ⚠️* | ❌ |
| Extension: Redis | ✅ | ⚠️** | ⚠️** | ❌ |
| Extension: S3 | ✅ | ⚠️** | ⚠️** | ⚠️** |

\* Use runtime-native SQLite (Deno has built-in SQLite, Bun has `bun:sqlite`)  
\*\* Requires HTTP-based client or runtime-specific adapters

## Testing Your Runtime Compatibility

### 1. Use the correct import path
```typescript
// ❌ Not runtime-agnostic (includes Node.js Server class)
import { Hocuspocus } from '@hocuspocus/server'

// ✅ Runtime-agnostic core only
import { Hocuspocus } from '@hocuspocus/server/core'

// ✅ Explicit Node.js (includes Server class)
import { Server } from '@hocuspocus/server/node'
```

### 2. Check for Node.js-specific imports
```typescript
// ❌ Not runtime-agnostic
import fs from 'node:fs'
import crypto from 'node:crypto'

// ✅ Runtime-agnostic (uses Web Standards)
import { defaultRuntimeCrypto } from '@hocuspocus/server/runtime'
// Use Web APIs (fetch, crypto.subtle, etc.)
```

### 3. Use runtime-agnostic extensions
```typescript
// ✅ Works everywhere
import { Logger } from '@hocuspocus/extension-logger'
import { Throttle } from '@hocuspocus/extension-throttle'

// ❌ Node.js only
import { SQLite } from '@hocuspocus/extension-sqlite'
import { Redis } from '@hocuspocus/extension-redis'
```

### 4. Test on multiple runtimes
```bash
# Node.js
node src/server.ts

# Deno
deno run --allow-net src/server.ts

# Bun
bun run src/server.ts
```

## Creating Custom Extensions for Multiple Runtimes

### Runtime-Agnostic Extension Example
```typescript
import type { Extension } from '@hocuspocus/server'

export const MyExtension = (config: any): Extension => ({
  async onLoadDocument({ documentName }) {
    // ✅ Use Web APIs available everywhere
    const response = await fetch(`https://api.example.com/docs/${documentName}`)
    const data = await response.arrayBuffer()
    return new Uint8Array(data)
  },
  
  async onStoreDocument({ documentName, document }) {
    // ✅ Use Web APIs
    const update = encodeStateAsUpdate(document)
    await fetch(`https://api.example.com/docs/${documentName}`, {
      method: 'PUT',
      body: update
    })
  }
})
```

### Runtime-Specific Storage Example
```typescript
// Detect runtime and use appropriate storage
const getStorage = () => {
  // Node.js
  if (typeof process !== 'undefined' && process.versions?.node) {
    return new NodeSQLiteStorage()
  }
  
  // Deno
  if (typeof Deno !== 'undefined') {
    return new DenoKVStorage()
  }
  
  // Bun
  if (typeof Bun !== 'undefined') {
    return new BunSQLiteStorage()
  }
  
  // Cloudflare Workers
  if (typeof caches !== 'undefined') {
    return new CloudflareD1Storage()
  }
  
  throw new Error('Unsupported runtime')
}
```

## Common Issues and Solutions

### Issue: "Cannot find module 'node:http'"
**Solution:** You're trying to use the `Server` class on a non-Node.js runtime. Use `Hocuspocus` instead.

```typescript
// ❌ Won't work on Deno/Bun
import { Server } from '@hocuspocus/server'

// ✅ Works everywhere
import { Hocuspocus } from '@hocuspocus/server'
```

### Issue: Extension doesn't work on my runtime
**Solution:** Check if the extension uses Node.js-specific dependencies. Create a custom extension using runtime-agnostic APIs or runtime-specific storage.

### Issue: WebSocket types don't match
**Solution:** Most WebSocket implementations follow the standard. Use type assertions if needed:

```typescript
// @ts-ignore - Runtime-specific WebSocket is compatible
hocuspocus.handleConnection(socket, request)
```

## Performance Considerations

| Runtime | Startup | Memory | Throughput | Use Case |
|---------|---------|--------|------------|----------|
| Node.js | Medium | Medium | High | General purpose, enterprise |
| Deno | Fast | Low | High | Modern apps, TypeScript-first |
| Bun | Fastest | Lowest | Highest | High-performance apps |
| CF Workers | Instant | N/A | Medium | Global edge, high availability |

## Next Steps

1. **Read** [`RUNTIMES.md`](./RUNTIMES.md) for detailed examples
2. **Explore** [`playground/backend/src/`](./playground/backend/src/) for working examples
3. **Test** your application on your target runtime
4. **Share** your experience and help improve the documentation!

## Resources

- [Hocuspocus Documentation](https://hocuspocus.dev)
- [Deno WebSocket API](https://deno.land/api?s=WebSocket)
- [Bun WebSocket API](https://bun.sh/docs/api/websockets)
- [Cloudflare Workers WebSocket](https://developers.cloudflare.com/workers/runtime-apis/websockets/)
- [Hono Framework](https://hono.dev) - Inspiration for runtime-agnostic design

## Questions?

- [Open an issue](https://github.com/ueberdosis/hocuspocus/issues)
- [Join Discord](https://discord.gg/WtJ49jGshW)
- [Read documentation](https://hocuspocus.dev)
