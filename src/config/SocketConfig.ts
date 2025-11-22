import { envConfig } from "./envConfig";
import io from "socket.io-client";

// Use PUBLIC_API_URL for browser WebSocket connections (publicly accessible URL)
// In Docker, PUBLIC_BASE_URL may be internal (e.g., http://nginx-proxy:5000)
// but browsers need the public URL (e.g., https://platform.getconfirmd.com)
const SOCKET = io(envConfig.PUBLIC_API_URL || envConfig.PUBLIC_BASE_URL, {
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionAttempts: Infinity,
  autoConnect: true,
  transports: ["websocket"],
});

export default SOCKET;
