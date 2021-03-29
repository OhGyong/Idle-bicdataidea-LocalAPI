// Mysql db 연결
let mysql = require("mysql");

var connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: "test_api",
    connectionLimit: 30
});

function getConnection(callback){
    connection.getConnection(function(err, conn){
        if(!err){
            console.log("db 연결성공")
            callback(conn);
        }else{
            console.log("db 연결실패")
        }
    })
    
}

module.exports = getConnection;

/*
getConnection((conn)=>{
    var check_email="oky7143@naver.com"
    conn.query('SELECT member_email FROM member WHERE member_email=?;', check_email, function(err, rows){
        console.log(rows);
    });
    conn.release();
getConnection((conn)=>{
    
})

})
*/