import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '../../types/next';
import { Server as ServerIO } from 'socket.io';
import { Server as NetServer } from 'http';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Get the workspace ID from the query parameters
  const { workspaceId } = req.query;
  
  if (!workspaceId || Array.isArray(workspaceId)) {
    return res.status(400).json({ error: 'Invalid workspace ID' });
  }

  // Check if socket.io server is already initialized
  if (res.socket.server.io) {
    console.log('Socket.io already running');
    return res.end();
  }

  console.log('Initializing Socket.io');
  const httpServer: NetServer = res.socket.server as any;
  const io = new ServerIO(httpServer, {
    path: '/api/ws',
    addTrailingSlash: false,
  });
  
  // Store the io instance on the server
  res.socket.server.io = io;

  // Set up workspace rooms for targeted messaging
  io.on('connection', (socket) => {
    const workspaceRoom = `workspace-${workspaceId}`;
    
    console.log(`Client connected: ${socket.id} to workspace: ${workspaceId}`);
    
    // Join the workspace-specific room
    socket.join(workspaceRoom);
    
    // Handle inbox subscription
    socket.on('subscribe-inbox', (inboxId) => {
      const inboxRoom = `inbox-${inboxId}`;
      console.log(`Client ${socket.id} subscribed to inbox: ${inboxId}`);
      socket.join(inboxRoom);
    });
    
    // Handle unsubscribing from inbox
    socket.on('unsubscribe-inbox', (inboxId) => {
      const inboxRoom = `inbox-${inboxId}`;
      console.log(`Client ${socket.id} unsubscribed from inbox: ${inboxId}`);
      socket.leave(inboxRoom);
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  console.log('Socket.io initialized');
  res.end();
}
