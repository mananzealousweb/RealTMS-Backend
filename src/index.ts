import dotenv from "dotenv";
import expressService from "./services/express.service";
import sequelizeService from "./services/sequelize.service";
import jwtService from "./services/jwt.service";
import socketService from "./services/socket.service";

dotenv.config();

const services = [expressService, sequelizeService, jwtService];

(async () => {
  try {
    // Initialize all services
    for (const service of services) {
      await service.init();
    }

    // Initialize Socket.IO AFTER Express
    const httpServer = expressService.getHttpServer();
    socketService.init(httpServer);

    console.log("✅ Server initialized successfully.");
  } catch (error) {
    console.error("❌ Server initialization failed:", error);
    process.exit(1);
  }
})();
