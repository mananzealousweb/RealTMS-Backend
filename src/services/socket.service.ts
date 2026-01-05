import { Server } from "socket.io";
import http from "http";

let io: Server | null = null;

const socketService = {
  init(httpServer: http.Server) {
    io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "*",
        credentials: true,
      },
    });

    io.on("connection", (socket) => {
      console.log("🔌 Socket connected:", socket.id);

      socket.on("disconnect", () => {
        console.log("❌ Socket disconnected:", socket.id);
      });
    });

    console.log("[SOCKET] Socket.IO service initialized");
    return io;
  },

  getIO() {
    if (!io) {
      throw new Error("Socket.IO not initialized");
    }
    return io;
  },

  // Broadcast to all connected clients
  emit(event: string, payload: any) {
    if (!io) return;
    io.emit(event, payload);
  },

  // Emit to specific user
  emitToUser(userId: number, event: string, payload: any) {
    if (!io) return;
    io.to(`user:${userId}`).emit(event, payload);
  },

  // Emit to specific task room
  emitToTask(taskId: number, event: string, payload: any) {
    if (!io) return;
    io.to(`task:${taskId}`).emit(event, payload);
  },

  // Emit to all except sender
  broadcast(event: string, payload: any) {
    if (!io) return;
    io.emit(event, payload);
  },
};

export default socketService;
