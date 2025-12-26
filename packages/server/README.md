# @hocuspocus/server
[![Version](https://img.shields.io/npm/v/@hocuspocus/server.svg?label=version)](https://www.npmjs.com/package/@hocuspocus/server)
[![Downloads](https://img.shields.io/npm/dm/@hocuspocus/server.svg)](https://npmcharts.com/compare/tiptap?minimal=true)
[![License](https://img.shields.io/npm/l/@hocuspocus/server.svg)](https://www.npmjs.com/package/@hocuspocus/server)
[![Sponsor](https://img.shields.io/static/v1?label=Sponsor&message=%E2%9D%A4&logo=GitHub)](https://github.com/sponsors/ueberdosis)

**🚀 Runtime Agnostic** - Works on Node.js, Deno, Bun, and Cloudflare Workers

## Introduction
Hocuspocus is an opinionated collaborative editing backend for [Tiptap](https://github.com/ueberdosis/tiptap) – based on [Y.js](https://github.com/yjs/yjs), a CRDT framework with a powerful abstraction of shared data.

## Multi-Runtime Support

Hocuspocus works across multiple JavaScript runtimes:

- ✅ **Node.js** - Full support with standalone `Server` class
- ✅ **Deno** - Use `Hocuspocus` class with Deno's native WebSocket  
- ✅ **Bun** - Use `Hocuspocus` class with Bun's WebSocket API
- ✅ **Cloudflare Workers** - Use `Hocuspocus` class with Durable Objects

### Quick Start

#### Node.js (Standalone)
```typescript
import { Server } from '@hocuspocus/server'

const server = new Server({ port: 1234 })
server.listen()
```

**Note:** The Node.js `Server` class requires the `ws` package. Install it separately:
```bash
npm install ws
```

#### Runtime-Agnostic (Deno, Bun, CF Workers)
```typescript
import { Hocuspocus } from '@hocuspocus/server/core'

const hocuspocus = new Hocuspocus()
// Integrate with your runtime's WebSocket implementation
```

See the [main repository](https://github.com/ueberdosis/hocuspocus) for detailed examples.

## Official Documentation
Documentation can be found in the [GitHub repository](https://github.com/ueberdosis/hocuspocus).

## License
Hocuspocus is open-sourced software licensed under the [MIT license](https://github.com/ueberdosis/hocuspocus/blob/main/LICENSE.md).
