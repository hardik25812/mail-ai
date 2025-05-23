import { NextApiRequest, NextApiResponse } from 'next';
import { WebSocketServer } from '../../lib/websocket-server';
import { createLogger } from '../../lib/logger';
import { Server as HttpServer } from 'http';

const logger = createLogger('websocket-api');

// Extend the socket server type to include our custom properties
declare global {
  interface Socket {
    server: HttpServer & {
      wsServerInitialized?: boolean;
    };
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the workspace ID and user ID from the query parameters
    const { workspaceId, userId } = req.query;
    
    if (!workspaceId || Array.isArray(workspaceId)) {
      return res.status(400).json({ error: 'Invalid workspace ID' });
    }

    // For WebSocket connections, we need to keep the connection open
    // This endpoint just handles the HTTP part of the WebSocket handshake
    // The actual WebSocket handling is in the WebSocketServer class
    
    // Check if the WebSocket server is already initialized
    const wsServer = WebSocketServer.getInstance();
    
    // Initialize the WebSocket server if not already
    // The server is created only once and attaches to the HTTP server
    if (res.socket && !res.socket.server.wsServerInitialized) {
      const httpServer = res.socket.server;
      wsServer.initialize(httpServer);
      
      // Mark as initialized to prevent multiple initializations
      res.socket.server.wsServerInitialized = true;
      logger.info('WebSocket server initialized');
    } else if (res.socket) {
      logger.info('WebSocket server already running');
    } else {
      logger.warn('Socket not available');
    }
    
    // Return successful response
    // The WebSocket upgrade will be handled by the WebSocketServer class
    res.status(200).json({ 
      success: true, 
      message: 'WebSocket server available',
      stats: wsServer.getStats()
    });
  } catch (error) {
    logger.error('Error in WebSocket API handler', { error });
    res.status(500).json({ error: 'Internal server error' });
  }
}
