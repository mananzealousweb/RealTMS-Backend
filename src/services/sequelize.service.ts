import User from "../models/User";
import dbConfig from "../config/database";
import Authorization from "../models/Authorization";
import Task from "../models/Task";
import Media from "../models/Media";
import Comment from "../models/Comment";

const sequelizeService = {
  init: async () => {
    try {
      const appModels = {
        User: User.initModel(dbConfig.db),
        Authorization: Authorization.initModel(dbConfig.db),
        Task: Task.initModel(dbConfig.db),
        Media: Media.initModel(dbConfig.db),
        Comment: Comment.initModel(dbConfig.db),
      };

      // Associate app models
      Object.values(appModels).forEach((model: any) => {
        if (model.associate) {
          model.associate(appModels);
        }
      });

      dbConfig.db
        .authenticate()
        .then(() => console.log("App database connected..."))
        .catch((err: any) => console.log("Error: " + err));

      console.log("[SEQUELIZE] Database service initialized");
    } catch (error) {
      console.log("[SEQUELIZE] Error during database service initialization");
      throw error;
    }
  },
};

export default sequelizeService;
