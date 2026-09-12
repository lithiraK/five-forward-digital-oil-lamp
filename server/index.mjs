import { WebSocketServer, WebSocket } from 'ws';

const PORT = 8787;
const wss = new WebSocketServer({ port: PORT });

console.log(`Five Forward local WebSocket server running on ws://localhost:${PORT}`);

const CEREMONY_OBJECTS = [
  'people',
  'innovation',
  'intelligence',
  'collaboration',
  'learning',
  'vision',
  'technology',
  'future',
];

function getInitialState() {
  const state = {};
  for (const obj of CEREMONY_OBJECTS) {
    state[obj] = 'pending';
  }
  return state;
}

let authoritativeState = getInitialState();

function broadcast(messageObj) {
  const data = JSON.stringify(messageObj);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

wss.on('connection', (socket) => {
  socket.send(JSON.stringify({
    type: 'SYSTEM_READY',
    message: 'Five Forward local server connected',
    timestamp: new Date().toISOString(),
  }));
  
  // Immediately send current state to new connections
  socket.send(JSON.stringify({
    type: 'STATE_SNAPSHOT',
    state: authoritativeState,
  }));

  socket.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      socket.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON message' }));
      return;
    }

    if (!message || !message.type) return;

    switch (message.type) {
      case 'REQUEST_STATE':
        socket.send(JSON.stringify({
          type: 'STATE_SNAPSHOT',
          state: authoritativeState,
        }));
        break;

      case 'COMPLETE_OBJECT': {
        const objKey = message.object;
        
        if (!CEREMONY_OBJECTS.includes(objKey)) {
          socket.send(JSON.stringify({ type: 'ERROR', message: `Unknown object: ${objKey}` }));
          break;
        }

        if (authoritativeState[objKey] === 'completed') {
          socket.send(JSON.stringify({ type: 'ERROR', message: `Object already completed: ${objKey}` }));
          break;
        }

        // Apply change and broadcast
        authoritativeState[objKey] = 'completed';
        broadcast({
          type: 'OBJECT_COMPLETED',
          object: objKey,
          state: authoritativeState,
        });
        break;
      }

      case 'RESET_CEREMONY':
        authoritativeState = getInitialState();
        broadcast({
          type: 'CEREMONY_RESET',
          state: authoritativeState,
        });
        break;

      case 'DRAG_START':
      case 'DRAG_MOVE':
      case 'DRAG_END':
        // Fast-path relay for drag events (do not modify authoritative state)
        if (CEREMONY_OBJECTS.includes(message.object)) {
          broadcast(message);
        }
        break;
        
      default:
        socket.send(JSON.stringify({ type: 'ERROR', message: `Unknown message type: ${message.type}` }));
    }
  });
});
