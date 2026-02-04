import { io } from "socket.io-client";

// Socket must connect directly to server (proxy doesn't forward WebSockets)
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

let socket = null;

export function getSocket(token) {
  if (!token) return null;
  if (socket && !socket.connected) {
    socket.disconnect();
    socket = null;
  }
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
