# Hocuspocus Runtime Examples

This directory contains working examples of Hocuspocus running on different JavaScript runtimes.

## Examples by Runtime

### Node.js Examples

#### 1. Standalone Server (`default.ts`)
The simplest way to run Hocuspocus on Node.js using the built-in `Server` class.

```bash
npm run playground:default
```

#### 2. Express Integration (`express.ts`)
Integration with Express.js using `express-ws`.

```bash
npm run playground:express
```

#### 3. Koa Integration (`koa.ts`)
Integration with Koa.js using `koa-easy-ws`.

```bash
npm run playground:koa
```

#### 4. Hono on Node.js (`hono.ts`)
Integration with Hono framework on Node.js.

```bash
npm --prefix ./playground/backend run dev src/hono.ts
```

### Deno Example (`deno.ts`)

Run Hocuspocus on Deno runtime.

```bash
deno run --allow-net playground/backend/src/deno.ts
```

Or with npm/jsr imports:
```bash
deno task dev playground/backend/src/deno.ts
```

**Features:**
- Uses Deno's native WebSocket API (`Deno.upgradeWebSocket`)
- No Node.js dependencies required
- Runtime-agnostic extension support

### Bun Example (`bun.ts`)

Run Hocuspocus on Bun runtime.

```bash
bun run playground/backend/src/bun.ts
```

**Features:**
- Uses Bun's native WebSocket API
- Fast startup and low memory usage
- Compatible with most Hocuspocus extensions

### Cloudflare Workers Example (`cloudflare-worker.ts`)

Deploy Hocuspocus to Cloudflare Workers.

```bash
# Install Wrangler
npm install -g wrangler

# Deploy
wrangler deploy playground/backend/src/cloudflare-worker.ts
```

**Features:**
- Edge deployment with global distribution
- Uses Cloudflare's WebSocket API
- Minimal cold start time

**Note:** Some extensions may not work on Cloudflare Workers due to runtime limitations. Use runtime-agnostic extensions or implement custom storage with Cloudflare D1 or KV.

## Extension Compatibility

### ✅ Runtime-Agnostic Extensions
These work on all runtimes:
- `@hocuspocus/extension-logger`
- `@hocuspocus/extension-throttle`
- `@hocuspocus/transformer`

### ⚠️ Node.js-Specific Extensions
These require Node.js:
- `@hocuspocus/extension-sqlite` (native SQLite)
- `@hocuspocus/extension-redis` (ioredis)
- `@hocuspocus/extension-s3` (AWS SDK)
- `@hocuspocus/extension-database` (Node.js DB drivers)

### 🔧 Runtime-Specific Alternatives

For non-Node.js runtimes:

**Deno:**
- Use Deno KV for storage
- Use Deno's native SQLite
- HTTP-based storage backends

**Bun:**
- Use Bun's native SQLite
- HTTP-based storage backends
- Redis-compatible stores

**Cloudflare Workers:**
- Use Cloudflare D1 (SQLite)
- Use Cloudflare KV
- Use Durable Objects for state
- HTTP-based storage backends

## Creating Custom Extensions

To create a runtime-agnostic extension:

```typescript
import type { Extension } from '@hocuspocus/server'

const MyExtension: Extension = {
  async onLoadDocument({ documentName }) {
    // Use runtime-agnostic APIs only
    // Avoid: fs, path, crypto (Node.js modules)
    // Use: Web APIs, fetch, etc.
  }
}
```

## Testing

To test if your code is runtime-agnostic:

1. **Check imports**: No `node:*` or Node.js-specific packages
2. **Use Web APIs**: `fetch`, `WebSocket`, `crypto.subtle`, etc.
3. **Test on multiple runtimes**: Run on Node.js, Deno, and Bun

## Production Deployment

### Node.js
```bash
npm install @hocuspocus/server
node --experimental-transform-types src/server.ts
```

### Deno
```bash
deno run --allow-net src/server.ts
```

### Bun
```bash
bun run src/server.ts
```

### Cloudflare Workers
```bash
wrangler deploy
```

## Performance Considerations

**Node.js:**
- Best ecosystem support
- Mature extensions
- Good for complex integrations

**Deno:**
- Secure by default
- TypeScript native
- Good for modern applications

**Bun:**
- Fastest startup
- Low memory usage
- Best for high-performance needs

**Cloudflare Workers:**
- Global edge deployment
- Lowest latency
- Best for worldwide users
- Limited runtime capabilities

## Learn More

- [Main Documentation](../../README.md)
- [Runtime Guide](../../RUNTIMES.md)
- [Hocuspocus Website](https://hocuspocus.dev)
