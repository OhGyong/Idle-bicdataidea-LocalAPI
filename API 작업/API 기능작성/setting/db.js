// Mysql db 연결
let mysql = require("mysql");

var connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "test_api",
    connectionLimit: 80
});

function getConnection(callback){
    connection.getConnection(function(err, conn){
        if(!err){
            console.log("db 연결성공")
            callback(conn);
        }else{
            console.log(err)
            console.log("db 연결실패")
        }
    })
    
}
module.exports = getConnection;
