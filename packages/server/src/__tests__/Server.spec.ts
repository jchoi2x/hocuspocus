import { describe, it, expect, afterEach } from 'vitest';
import { Server, type ServerConfiguration } from '../Server';

let server: Awaited<ReturnType<Server['listen']>> | null = null;

/**
 * Helper function to create a new Hocuspocus server for testing
 */
export async function createTestServer(options?: Partial<ServerConfiguration>) {
  const testServer = new Server({
    quiet: true,
    port: 0, // Random port for concurrent testing
    ...options,
  });
  
  server = await testServer.listen();
  return server;
}

/**
 * Cleanup function to destroy test server
 */
export async function destroyTestServer() {
  if (server?.server) {
    await server.server.destroy();
    server = null;
  }
}

describe('Server', () => {
  afterEach(async () => {
    await destroyTestServer();
  });

  describe('address', () => {
    it('returns a dynamic HTTP/WebSocket address with the correct port', async () => {
      const hocuspocus = await createTestServer({
        port: 4010,
      });

      expect(hocuspocus.server!.address.port).toBe(4010);
      expect(hocuspocus.server!.httpURL).toBe('http://0.0.0.0:4010');
      expect(hocuspocus.server!.webSocketURL).toBe('ws://0.0.0.0:4010');
    });
  });
});
