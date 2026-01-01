import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import {
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
} from "../utils/Apperror";

export interface JwtUserPayload {
  user_id: number;
  email: string;
}

interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn?: string | number;
  refreshExpiresIn?: string | number;
}

let jwtConfig: JwtConfig | null = null;

const jwtService = {
  init() {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!accessSecret || !refreshSecret) {
      throw new BadRequestError({
        message: "JWT secrets are missing in environment variables",
      });
    }

    jwtConfig = {
      accessSecret,
      refreshSecret,
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    };

    console.log("[JWT] Service initialized");
  },

  generateAccessToken(payload: JwtUserPayload): string {
    if (!jwtConfig)
      throw new BadRequestError({ message: "JWT service not initialized" });

    return jwt.sign(payload, jwtConfig.accessSecret, {
      expiresIn: jwtConfig.accessExpiresIn,
    });
  },

  generateRefreshToken(payload: JwtUserPayload): string {
    if (!jwtConfig)
      throw new BadRequestError({ message: "JWT service not initialized" });

    return jwt.sign(payload, jwtConfig.refreshSecret, {
      expiresIn: jwtConfig.refreshExpiresIn,
    });
  },

  refreshAccessToken(refreshToken: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = this.verifyRefreshToken(refreshToken);

    const newAccessToken = this.generateAccessToken({
      user_id: payload.user_id,
      email: payload.email,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken, // Keep the same refresh token
    };
  },

  generateTokenPair(payload: JwtUserPayload) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  },

  verifyAccessToken(token: string): JwtUserPayload {
    if (!jwtConfig) throw new Error("JWT service not initialized");

    try {
      return jwt.verify(token, jwtConfig.accessSecret) as JwtUserPayload;
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new UnauthorizedError({ message: "Access token expired" });
      }
      throw new UnauthorizedError({ message: "Invalid access token" });
    }
  },

  verifyRefreshToken(token: string): JwtUserPayload {
    if (!jwtConfig) throw new Error("JWT service not initialized");

    try {
      return jwt.verify(token, jwtConfig.refreshSecret) as JwtUserPayload;
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        throw new ForbiddenError({ message: "Refresh token expired" });
      }
      throw new ForbiddenError({ message: "Invalid refresh token" });
    }
  },

  rotateTokens(refreshToken: string) {
    const payload = this.verifyRefreshToken(refreshToken);

    return this.generateTokenPair({
      user_id: payload.user_id,
      email: payload.email,
    });
  },

  decode(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload;
  },

  isExpired(token: string): boolean {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded?.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  },
};

export default jwtService;
