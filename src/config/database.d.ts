// src/config/database.d.ts
import { Sequelize } from "sequelize";

declare module "../config/database" {
  export const db: Sequelize;
  export const development: {
    username: string;
    password: string | null;
    database: string;
    host: string;
    port: number;
    dialect: string;
  };
  export const staging: {
    username: string;
    password: string | null;
    database: string;
    host: string;
    port: number;
    dialect: string;
  };
  export const production: {
    username: string;
    password: string | null;
    database: string;
    host: string;
    port: number;
    dialect: string;
  };
}
