import { Response, NextFunction } from "express";
import Authorization from "../models/Authorization";
import jwtService from "../services/jwt.service";
import { UnauthorizedError, NotFoundError } from "../utils/Apperror";
import { handleError } from "../utils/errorHandler";

export interface AuthenticatedRequest extends Request {
  user?: {
    user_id: number;
    email: string;
  };
}

/**
 * 🔐 JWT Authentication Middleware
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError({ message: "Authorization token missing" });
    }

    const accessToken = authHeader.split(" ")[1];

    // Try to verify access token
    try {
      const payload = jwtService.verifyAccessToken(accessToken);
      const authRecord = await Authorization.findOne({
        where: { user_id: payload.user_id },
      });

      if (!authRecord || !authRecord.refresh_token) {
        throw new UnauthorizedError({
          message: "Session expired. Please login again.",
        });
      }

      res.setHeader("x-access-token", "");
      req.user = payload;
      return next();
    } catch (accessError: any) {
      // Access token expired, try to decode it without verification
      const decoded = jwtService.decode(accessToken);

      if (!decoded || !decoded.user_id) {
        throw new UnauthorizedError({ message: "Invalid token" });
      }

      // Find auth record by user_id
      const authRecord = await Authorization.findOne({
        where: { user_id: decoded.user_id },
      });

      if (!authRecord || !authRecord.refresh_token) {
        throw new UnauthorizedError({
          message: "Session expired. Please login again.",
        });
      }

      // Try to refresh the access token using refresh token
      try {
        const { accessToken: newAccessToken, refreshToken: sameRefreshToken } =
          jwtService.refreshAccessToken(authRecord.refresh_token);

        console.log("REFRESHING ACCESS TOKEN ONLY");

        // Update only access token in database
        await authRecord.update({
          access_token: newAccessToken,
        });

        // Send only new access token to client
        res.setHeader("x-access-token", newAccessToken);

        req.user = {
          user_id: decoded.user_id,
          email: decoded.email,
        };

        return next();
      } catch (refreshError: any) {
        // Refresh token is invalid or expired
        console.log("Refresh token verification failed:", refreshError.message);

        // Delete the invalid auth record
        await authRecord.destroy();

        throw new UnauthorizedError({
          message: "Session expired. Please login again.",
        });
      }
    }
  } catch (error) {
    handleError(error, req, res, next);
  }
};
