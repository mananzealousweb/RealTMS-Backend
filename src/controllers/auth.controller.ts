import { Request, Response, NextFunction } from "express";
import {
  LOGIN_USER_SCHEMA,
  REGISTER_USER_SCHEMA,
} from "../utils/validationSchema";
import { handleError } from "../utils/errorHandler";
import AuthService from "../services/auth.service";
import User from "../models/User";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

const authController = {
  login: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      // 1️⃣ Validate request body
      await LOGIN_USER_SCHEMA.validate(req.body, {
        abortEarly: false,
      });

      const { email, password } = req.body;

      // 2️⃣ Call service
      const result = await AuthService.login(email, password);

      // 3️⃣ Respond
      return res.status(200).json({
        success: true,
        message: "Login successful",
        user: result?.user,
        access_token: result?.tokens?.accessToken,
      });
    } catch (error: any) {
      handleError(error, req, res, next);
    }
  },

  register: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      // 1️⃣ Validate request body
      await REGISTER_USER_SCHEMA.validate(req.body, {
        abortEarly: false,
      });

      // 2️⃣ Register user
      const result = await AuthService.register(req.body);

      // 3️⃣ Respond
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: result?.user,
        access_token: result?.tokens?.accessToken,
      });
    } catch (error: any) {
      handleError(error, req, res, next);
    }
  },
  logout: async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await AuthService.logout(req.user!.user_id);

      return res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error) {
      handleError(error, req, res, next);
    }
  },
  getUser: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      const user = await User.findByPk(req.user?.user_id, {
        attributes: ["id", "first_name", "last_name", "age", "email"],
      });
      return res.status(201).json({
        success: true,
        message: "User data retrieved successfully",
        user,
      });
    } catch (error: any) {
      console.log("ERROR", error);
      handleError(error, req, res, next);
    }
  },
};

export default authController;
