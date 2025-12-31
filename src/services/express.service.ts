import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";


const routeFiles = fs
  .readdirSync(__dirname + "/../routes/")
  .filter((file) => !file.startsWith("."));

let server: express.Express;
let routes: any[] = [];

const expressService = {

  init: async () => {
    try {
      for (const file of routeFiles) {
        const route = await import(`../routes/${file}`);
        const routeName = Object.keys(route)[0];
        // Convert camelCase routeName to kebab-case
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
        origin: "*",
      };

      //common middleware
      server = express();
      server.use(cors(corsOptions));
      server.use(bodyParser.json());
      routes.forEach(({ route, routeName }) => {
        server.use(`/api/${routeName}`, route);
      });
      server.use(
        "/uploads/",
        express.static(path.join(__dirname, "../../uploads"))
      );

      // server.use(routes);
      server.listen(process.env.SERVER_PORT);
      console.log("[EXPRESS] Express service initialized");
    } catch (error) {
      console.log("[EXPRESS] Error during express service initialization");
      throw error;
    }
  },
};

export default expressService;
