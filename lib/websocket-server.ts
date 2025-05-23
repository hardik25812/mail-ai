/**
 * WebSocket Server Implementation
 * 
 * Handles WebSocket connections from clients and broadcasts events to connected clients.
 * Supports workspace-specific channels for targeted notifications.
 */

import { WebSocket, WebSocketServer as WSServer } from 'ws';
import { Server as HttpServer } from 'http';
import { parse } from 'url';
import { createLogger } from './logger';

const logger = createLogger('websocket-server');

interface WebSocketWithMetadata extends WebSocket {
  isAlive: boolean;
  workspaceId?: string;
  userId?: string;
  clientId: string;
}

interface WebSocketMessage {
  type: string;
  payload: any;
}

/**
 * Singleton WebSocket server implementation
 */
export class WebSocketServer {
  private static instance: WebSocketServer;
  private wss: WSServer | null = null;
  private clients: Map<string, WebSocketWithMetadata> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): WebSocketServer {
    if (!WebSocketServer.instance) {
      WebSocketServer.instance = new WebSocketServer();
    }
    return WebSocketServer.instance;
  }
  
  /**
   * Initialize the WebSocket server with an HTTP server
   */
  public initialize(server: HttpServer): void {
    if (this.wss) {
      this.cleanup();
    }
    
    logger.info('Initializing WebSocket server');
    
    this.wss = new WSServer({ noServer: true });
    
    // Handle upgrade requests
    server.on('upgrade', (request, socket, head) => {
      if (!request.url) {
        socket.destroy();
        return;
      }
      
      const { pathname, query } = parse(request.url, true);
      
      if (pathname === '/api/ws') {
        this.wss!.handleUpgrade(request, socket, head, (ws) => {
          const workspaceId = query.workspaceId as string;
          const userId = query.userId as string;
          const clientId = Math.random().toString(36).substring(2, 15);
          
          const client = ws as WebSocketWithMetadata;
          client.isAlive = true;
          client.workspaceId = workspaceId;
          client.userId = userId;
          client.clientId = clientId;
          
          this.clients.set(clientId, client);
          
          logger.info(`Client connected: ${clientId} (workspace: ${workspaceId}, user: ${userId})`);
          this.wss!.emit('connection', client);
        });
      } else {
        socket.destroy();
      }
    });
    
    // Handle new connections
    this.wss.on('connection', (ws: WebSocketWithMetadata) => {
      // Keep track of client connection status
      ws.on('pong', () => {
        ws.isAlive = true;
      });
      
      // Handle incoming messages
      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data) as WebSocketMessage;
          this.handleMessage(ws, message);
        } catch (error) {
          logger.error('Error handling WebSocket message', { error });
        }
      });
      
      // Handle client disconnection
      ws.on('close', () => {
        logger.info(`Client disconnected: ${ws.clientId}`);
        this.clients.delete(ws.clientId);
      });
      
      // Send welcome message
      this.sendToClient(ws, 'connected', {
        message: 'Connected to WebSocket server',
        clientId: ws.clientId,
        workspaceId: ws.workspaceId,
        timestamp: new Date().toISOString()
      });
    });
    
    // Setup heartbeat to detect disconnected clients
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client) => {
        if (client.isAlive === false) {
          logger.info(`Terminating unresponsive client: ${client.clientId}`);
          client.terminate();
          this.clients.delete(client.clientId);
          return;
        }
        
        client.isAlive = false;
        client.ping();
      });
    }, 30000); // Check every 30 seconds
    
    logger.info('WebSocket server initialized');
  }
  
  /**
   * Handle incoming messages from clients
   */
  private handleMessage(client: WebSocketWithMetadata, message: WebSocketMessage): void {
    logger.debug(`Received message from client ${client.clientId}`, { type: message.type });
    
    switch (message.type) {
      case 'subscribe-workspace':
        if (message.payload && message.payload.workspaceId) {
          client.workspaceId = message.payload.workspaceId;
          logger.info(`Client ${client.clientId} subscribed to workspace ${client.workspaceId}`);
          this.sendToClient(client, 'subscription-confirmed', {
            workspaceId: client.workspaceId,
            timestamp: new Date().toISOString()
          });
        }
        break;
        
      case 'subscribe-inbox':
        // Track inbox subscriptions if needed
        if (message.payload && message.payload.inbox_id) {
          logger.info(`Client ${client.clientId} subscribed to inbox ${message.payload.inbox_id}`);
          // Could store inbox subscriptions in a separate map if needed
        }
        break;
        
      case 'ping':
        // Simple ping/pong for client initiated checks
        this.sendToClient(client, 'pong', {
          timestamp: new Date().toISOString()
        });
        break;
        
      default:
        logger.debug(`Unhandled message type: ${message.type}`);
    }
  }
  
  /**
   * Send a message to a specific client
   */
  public sendToClient(client: WebSocketWithMetadata, type: string, payload: any): void {
    if (client.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload
      };
      
      client.send(JSON.stringify(message));
    }
  }
  
  /**
   * Broadcast a message to all connected clients
   */
  public broadcast(type: string, payload: any): void {
    logger.debug(`Broadcasting message to all clients`, { type });
    
    this.clients.forEach((client) => {
      this.sendToClient(client, type, payload);
    });
  }
  
  /**
   * Broadcast a message to clients in a specific workspace
   */
  public broadcastToWorkspace(workspaceId: string, type: string, payload: any): void {
    logger.debug(`Broadcasting message to workspace ${workspaceId}`, { type });
    
    this.clients.forEach((client) => {
      if (client.workspaceId === workspaceId) {
        this.sendToClient(client, type, payload);
      }
    });
  }
  
  /**
   * Broadcast a message to a specific user across all their connections
   */
  public broadcastToUser(userId: string, type: string, payload: any): void {
    logger.debug(`Broadcasting message to user ${userId}`, { type });
    
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        this.sendToClient(client, type, payload);
      }
    });
  }
  
  /**
   * Get the number of connected clients
   */
  public getConnectionCount(): number {
    return this.clients.size;
  }
  
  /**
   * Get connection statistics
   */
  public getStats(): any {
    // Count clients by workspace
    const workspaceStats: Record<string, number> = {};
    
    this.clients.forEach((client) => {
      const workspaceId = client.workspaceId || 'unknown';
      workspaceStats[workspaceId] = (workspaceStats[workspaceId] || 0) + 1;
    });
    
    return {
      totalConnections: this.clients.size,
      workspaceConnections: workspaceStats
    };
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    logger.info('Cleaning up WebSocket server resources');
    
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    
    this.clients.clear();
  }
}
