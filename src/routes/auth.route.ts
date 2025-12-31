import { authMiddleware } from "../middlewares/auth.middleware";
import authController from "../controllers/auth.controller";
import { Router } from "express";

const auth = Router();
auth.get("/get", authMiddleware, authController.getUser);
auth.post("/login", authController.login);
auth.post("/register", authController.register);
export { auth };
