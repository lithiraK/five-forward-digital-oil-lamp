import { useCallback, useEffect, useRef, useState } from 'react';
import type { CeremonyObject, CeremonyState } from '../types/ceremony';
import type {
  ClientToServerMessage,
  ServerToClientMessage,
} from '../types/protocol';
import { initialCeremonyState } from './initialState';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

export interface ActiveDragState {
  object: CeremonyObject;
  clientId: string;
  x: number;
  y: number;
}

type DragListener = (dragState: ActiveDragState | null) => void;
const dragListeners = new Set<DragListener>();

export const DragEmitter = {
  emit: (state: ActiveDragState | null) => {
    dragListeners.forEach(listener => listener(state));
  },
  subscribe: (listener: DragListener) => {
    dragListeners.add(listener);
    return () => { dragListeners.delete(listener); };
  }
};

// Derive WebSocket URL dynamically based on the current browser host.
// This allows tablets/phones on the local network (e.g., 192.168.x.x) to connect automatically.
const getWebSocketUrl = () => {
  const envUrl = import.meta.env.VITE_WS_URL;
  // If an explicit custom override is provided in .env (that isn't just the default localhost), use it
  if (envUrl && envUrl !== 'ws://localhost:8787') {
    return envUrl;
  }
  
  // Otherwise, dynamically connect to port 8787 on whatever IP/hostname served the frontend
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    return `${protocol}//${host}:8787`;
  }
  
  return 'ws://localhost:8787';
};

const WS_URL = getWebSocketUrl();

export function useCeremonyWebSocket() {
  const [state, setState] = useState<CeremonyState>(initialCeremonyState);
  const [status, setStatus] = useState<ConnectionStatus>('connecting');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  
  // Unique client ID to prevent self-echo drag jitter
  const clientId = useRef(Math.random().toString(36).substring(2, 9)).current;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      // Ask for current state explicitly upon connection/reconnection
      ws.send(JSON.stringify({ type: 'REQUEST_STATE' }));
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as ServerToClientMessage;

        switch (message.type) {
          case 'SYSTEM_READY':
            console.log(`[WebSocket] ${message.message} (Server time: ${message.timestamp})`);
            break;
          case 'STATE_SNAPSHOT':
          case 'OBJECT_COMPLETED':
          case 'CEREMONY_RESET':
            setState(message.state);
            DragEmitter.emit(null); // Clear drag on state change
            break;
          case 'DRAG_START':
          case 'DRAG_MOVE':
            DragEmitter.emit({ object: message.object, clientId: message.clientId, x: message.x, y: message.y });
            break;
          case 'DRAG_END':
            // Instead of prev checking, we just clear it. Since only one object can realistically be dragged 
            // by a single remote client at a time, emitting null is safe and simplifies things.
            DragEmitter.emit(null);
            break;
          case 'ERROR':
            console.error('[WebSocket Server Error]', message.message);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    ws.onclose = () => {
      setStatus('disconnected');
      wsRef.current = null;
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = () => {
      // onerror is usually followed by onclose, which handles reconnect.
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on deliberate unmount
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  const sendMessage = useCallback((msg: ClientToServerMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    } else {
      console.warn('Cannot send message, WebSocket is not connected');
    }
  }, []);

  return { state, status, sendMessage, clientId };
}
