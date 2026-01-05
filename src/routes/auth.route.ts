import { authMiddleware } from "../middlewares/auth.middleware";
import authController from "../controllers/auth.controller";
import { Router } from "express";

const auth = Router();
auth.get("/user", authMiddleware, authController.getUser);
auth.post("/login", authController.login);
auth.post("/register", authController.register);
auth.delete("/logout", authMiddleware, authController.logout);

export { auth };
