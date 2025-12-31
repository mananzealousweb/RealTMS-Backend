require("dotenv/config");
const { Sequelize } = require("sequelize");

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_DIALECT } =
  process.env;

// Sequelize instance for app usage
const db = new Sequelize(DB_NAME || "", DB_USER || "", DB_PASSWORD || "", {
  host: DB_HOST,
  port: Number(DB_PORT) || 3306,
  dialect: DB_DIALECT || "mysql",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    // MySQL-specific options go directly here, not nested in 'options'
    connectTimeout: 30000, // Connection timeout
    ssl: {
      rejectUnauthorized: false, // Equivalent to trustServerCertificate
    },
  },
});

// Export both: CLI config + db instance
module.exports = {
  development: {
    username: DB_USER || "root",
    password: DB_PASSWORD || null,
    database: DB_NAME || "database_development",
    host: DB_HOST || "127.0.0.1",
    port: Number(DB_PORT) || 3306,
    dialect: DB_DIALECT || "mysql",
  },
  staging: {
    username: DB_USER || "root",
    password: DB_PASSWORD || null,
    database: DB_NAME || "database_staging",
    host: DB_HOST || "127.0.0.1",
    port: Number(DB_PORT) || 3306,
    dialect: DB_DIALECT || "mysql",
  },
  production: {
    username: DB_USER || "root",
    password: DB_PASSWORD || null,
    database: DB_NAME || "database_production",
    host: DB_HOST || "127.0.0.1",
    port: Number(DB_PORT) || 3306,
    dialect: DB_DIALECT || "mysql",
  },
  db,
};