const sql = require("mysql2")
require("dotenv").config()

module.exports.DB = sql.createConnection({
    host: process.env.HOST_NAME,
    user: process.env.USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
})