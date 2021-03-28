// Mysql db 연결
let mysql = require("mysql");
var connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "test_api",
});

module.exports = connection;