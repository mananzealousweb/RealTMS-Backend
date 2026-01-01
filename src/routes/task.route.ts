import { authMiddleware } from "../middlewares/auth.middleware";
import { Router } from "express";
import taskController from "../controllers/task.controller";
import { uploadTaskFiles } from "../middlewares/upload.middleware";

const task = Router();

task.post("/", authMiddleware, uploadTaskFiles, taskController.add);
task.get("/", authMiddleware, taskController.get);
task.get("/:id", authMiddleware, taskController.getById);
task.put("/:id", authMiddleware, uploadTaskFiles, taskController.update);
task.delete("/:id", authMiddleware, taskController.delete);

export { task };
