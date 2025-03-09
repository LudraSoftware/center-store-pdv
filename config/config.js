require('dotenv').config();

module.exports = {
  development: {
    dialect: process.env.DB_DIALECT ,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME+ '_dev',
    username: process.env.DB_USER,
    password: process.env.DB_PASS
  },
  test: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME + '_test',
    username: process.env.DB_USER,
    password: process.env.DB_PASS
  },
  production: {
    dialect: process.env.DB_DIALECT,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME + '_prod',
    username: process.env.DB_USER,
    password: process.env.DB_PASS
  }
};

