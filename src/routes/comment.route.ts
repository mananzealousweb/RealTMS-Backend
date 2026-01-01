import { commentController } from "../controllers/comment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { Router } from "express";

const comment = Router();

comment.post("/", authMiddleware, commentController.add);
comment.get("/task/:taskId", authMiddleware, commentController.getByTask);
comment.put("/:id", authMiddleware, commentController.update);
comment.delete("/:id", authMiddleware, commentController.delete);

export { comment };
