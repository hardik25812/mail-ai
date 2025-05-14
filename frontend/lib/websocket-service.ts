import { toast } from 'sonner';

export interface WebSocketMessage {
  type: string;
  payload: any;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectInterval: number = 3000; // 3 seconds
  private maxReconnectAttempts: number = 5;
  private reconnectAttempts: number = 0;
  private intentionallyClosed: boolean = false;
  
  /**
   * Connects to the WebSocket server using the provided workspace ID
   */
  connect(workspaceId: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.disconnect();
    }
    
    try {
      this.intentionallyClosed = false;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      
      this.socket = new WebSocket(`${protocol}//${host}/api/ws?workspaceId=${workspaceId}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket connection established');
        this.reconnectAttempts = 0;
      };
      
      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed', event);
        
        if (!this.intentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
          console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(workspaceId);
          }, this.reconnectInterval);
        } else if (!this.intentionallyClosed) {
          toast.error('Lost connection to the server. Please refresh the page to reconnect.');
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Process the message based on its type
          if (message.type && this.listeners.has(message.type)) {
            const handlers = this.listeners.get(message.type);
            if (handlers) {
              handlers.forEach((handler) => {
                try {
                  handler(message.payload);
                } catch (error) {
                  console.error(`Error in message handler for type ${message.type}:`, error);
                }
              });
            }
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      return this.socket;
    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      return null;
    }
  }
  
  /**
   * Disconnects from the WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.intentionallyClosed = true;
      this.socket.close();
      this.socket = null;
    }
  }
  
  /**
   * Subscribes to a specific message type
   */
  subscribe(type: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.add(callback);
    }
    
    // Return an unsubscribe function
    return () => {
      const handlers = this.listeners.get(type);
      if (handlers) {
        handlers.delete(callback);
        
        if (handlers.size === 0) {
          this.listeners.delete(type);
        }
      }
    };
  }
  
  /**
   * Sends a message to the WebSocket server
   */
  send(type: string, payload?: any): boolean {
    if (this.socket?.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        payload: payload || {}
      };
      
      this.socket.send(JSON.stringify(message));
      return true;
    }
    
    return false;
  }
  
  /**
   * Checks if the WebSocket connection is open
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Create a singleton instance
const websocketService = new WebSocketService();

export default websocketService;
