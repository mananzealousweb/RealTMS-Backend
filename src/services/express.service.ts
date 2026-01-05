import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import http from "http";

const routeFiles = fs
  .readdirSync(__dirname + "/../routes/")
  .filter((file) => !file.startsWith("."));

let app: express.Express;
let httpServer: http.Server;
let routes: any[] = [];

const expressService = {
  init: async () => {
    try {
      // Load routes
      for (const file of routeFiles) {
        const route = await import(`../routes/${file}`);
        const routeName = Object.keys(route)[0];

        const kebabCaseRouteName = routeName
          .replace(/([a-z])([A-Z])/g, "$1-$2")
          .toLowerCase();

        if (typeof route[routeName] === "function" || route[routeName].router) {
          routes.push({
            route: route[routeName],
            routeName: kebabCaseRouteName,
          });
        } else {
          console.error(`[EXPRESS] Invalid route export in file ${file}`);
        }
      }

      const corsOptions = {
        origin: process.env.CLIENT_URL || "*",
        credentials: true,
        exposedHeaders: ["x-access-token"],
      };

      // Initialize Express
      app = express();
      app.use(cors(corsOptions));
      app.use(bodyParser.json());

      // Register routes
      routes.forEach(({ route, routeName }) => {
        app.use(`/api/${routeName}`, route);
      });

      // Static files
      app.use(
        "/uploads/",
        express.static(path.join(__dirname, "../../uploads"))
      );

      // Create HTTP server (needed for Socket.IO)
      httpServer = http.createServer(app);

      // Start server
      httpServer.listen(process.env.SERVER_PORT, () => {
        console.log(
          `[EXPRESS] Server running on port ${process.env.SERVER_PORT}`
        );
      });

      console.log("[EXPRESS] Express service initialized");
    } catch (error) {
      console.log("[EXPRESS] Error during express service initialization");
      throw error;
    }
  },

  getHttpServer() {
    if (!httpServer) {
      throw new Error("HTTP Server not initialized");
    }
    return httpServer;
  },

  getApp() {
    if (!app) {
      throw new Error("Express app not initialized");
    }
    return app;
  },
};

export default expressService;
