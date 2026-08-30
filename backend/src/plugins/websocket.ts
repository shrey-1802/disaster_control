import type { FastifyInstance } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import type { WebSocket } from 'ws';

export interface OperationalBroadcastEvent {
  event: string;
  payload: unknown;
  sector?: string;
  roleScope?: string[];
  timestamp: string;
}

class WebSocketManager {
  private clients = new Set<WebSocket>();

  public registerClient(socket: WebSocket): void {
    this.clients.add(socket);

    socket.on('close', () => {
      this.clients.delete(socket);
    });

    socket.on('error', (err) => {
      console.warn('WebSocket client error:', err);
      this.clients.delete(socket);
    });

    // Send initial handshake acknowledgement
    socket.send(JSON.stringify({
      event: 'system.connected',
      payload: { message: 'Connected to DISISTA CONTROL Real-Time Telemetry Stream.' },
      timestamp: new Date().toISOString()
    }));
  }

  public broadcast(event: string, payload: unknown, roleScope?: string[]): void {
    const message = JSON.stringify({
      event,
      payload,
      roleScope,
      timestamp: new Date().toISOString()
    });

    for (const client of this.clients) {
      if (client.readyState === 1) { // 1 = OPEN
        try {
          client.send(message);
        } catch (err) {
          console.warn('Failed to send WebSocket message to client:', err);
        }
      }
    }
  }
}

export const wsManager = new WebSocketManager();

export async function registerWebSocketPlugin(app: FastifyInstance): Promise<void> {
  await app.register(fastifyWebsocket);

  app.get('/ws/telemetry', { websocket: true }, (socket, _req) => {
    wsManager.registerClient(socket);
  });
}
