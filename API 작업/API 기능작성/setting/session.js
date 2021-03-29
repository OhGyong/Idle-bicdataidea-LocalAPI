// 세션 연결
let session = require('express-session');
let { Cookie } = require("express-session");
let MySQLStore = require('express-mysql-session')(session);

var session_setting=session({

    //key: 'sid', // 세션의 키 값
    secret: 'node-session', // 세션의 비밀 키(암호?)
    resave: false, // 세션을 항상 저장할 지 여부
    saveUninitialized: true, //세션이 저장되기 전에 uninitialize 상태로 저장
    
    store:new MySQLStore({
        port:3306,
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: 'test_api'
      })

    /*
    cookie:{
        maxAge:5000
    },
    */
      
  });

  module.exports=session_setting;