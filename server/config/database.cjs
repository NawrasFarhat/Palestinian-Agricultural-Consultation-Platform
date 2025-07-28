require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'agricultural_user',
    password: process.env.DB_PASS || 'agricultural_pass',
    database: process.env.DB_NAME || 'senior',
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  },
  test: {
    username: process.env.DB_USER || 'agricultural_user',
    password: process.env.DB_PASS || 'agricultural_pass',
    database: process.env.DB_NAME_TEST || 'senior_test',
    host: process.env.DB_HOST || 'mysql',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}; 