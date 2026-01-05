import bcrypt from "bcryptjs";
import User from "../models/User";
import Authorization from "../models/Authorization";
import jwtService from "./jwt.service";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/Apperror";
import { db } from "../config/database";

class AuthService {
  /**
   * 🔐 Login user with email & password
   */
  static async login(email: string, password: string) {
    return await db.transaction(async (t) => {
      // 1️⃣ Find user
      const user = await User.findOne({ where: { email }, transaction: t });

      if (!user) {
        throw new NotFoundError({ message: "User not found" });
      }

      // 2️⃣ Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new BadRequestError({ message: "Invalid email or password" });
      }

      // 3️⃣ Generate JWT tokens
      const payload = {
        user_id: user.id,
        email: user.email,
      };

      const { accessToken, refreshToken } =
        jwtService.generateTokenPair(payload);

      // 4️⃣ Save / Update authorization record
      const auth = await Authorization.findOne({
        where: { user_id: user.id },
        transaction: t,
      });
      if (auth) {
        await auth.update(
          {
            access_token: accessToken,
            refresh_token: refreshToken,
          },
          { transaction: t }
        );
      } else {
        await Authorization.create(
          {
            user_id: user.id,
            access_token: accessToken,
            refresh_token: refreshToken,
          },
          { transaction: t }
        );
      }

      // 5️⃣ Return response data
      return {
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    });
  }

  static async register(payload: {
    first_name: string;
    last_name: string;
    age?: number;
    email: string;
    password: string;
  }) {
    return await db.transaction(async (t) => {
      const { first_name, last_name, age, email, password } = payload;

      // 1️⃣ Check if user already exists
      const existingUser = await User.findOne({
        where: { email },
        transaction: t,
      });
      if (existingUser) {
        throw new ConflictError({ message: "Email already registered" });
      }

      // 2️⃣ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3️⃣ Create user
      const user = await User.create(
        {
          first_name,
          last_name,
          age,
          email,
          password: hashedPassword,
        },
        { transaction: t }
      );

      // 4️⃣ Generate tokens
      const tokenPayload = {
        user_id: user.id,
        email: user.email,
      };

      const { accessToken, refreshToken } =
        jwtService.generateTokenPair(tokenPayload);

      // 5️⃣ Save authorization record
      await Authorization.create(
        {
          user_id: user.id,
          access_token: accessToken,
          refresh_token: refreshToken,
        },
        { transaction: t }
      );

      // 6️⃣ Return response
      return {
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    });
  }

  static async logout(userId: number) {
    return await db.transaction(async (t) => {
      const auth = await Authorization.findOne({
        where: { user_id: userId },
        transaction: t,
      });

      if (!auth) {
        // Already logged out or session missing
        return true;
      }

      // Soft delete authorization (invalidate tokens)
      await auth.destroy({ transaction: t });

      return true;
    });
  }
}

export default AuthService;
