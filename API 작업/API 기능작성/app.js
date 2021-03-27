let dotenv = require('dotenv')
let mysql = require("mysql");
let nodemailer = require('nodemailer');
let nodeDate = require('date-utils');
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');
let { send } = require("process");
let { time } = require("console");
let session = require('express-session');
let { Cookie } = require("express-session");
let MySQLStore = require('express-mysql-session')(session);

dotenv.config({
  "path" : "./env"
})

require('dotenv').config();

var app = module.exports = express();

app.use(session({
    //key: 'sid', // 세션의 키 값
    secret: 'node-session', // 세션의 비밀 키(암호?)
    resave: false, // 세션을 항상 저장할 지 여부
    saveUninitialized: true, //세션이 저장되기 전에 uninitialize 상태로 저장
    /*
    cookie:{
        maxAge:5000
    },
    */
    store:new MySQLStore({
        port:3306,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'test_api'
    })
    
}))
 
const port = 3000 //포트번호
 

// routes 파일 호출
var indexapp = require('./routes/index');
var usersapp = require('./routes/users');
var membersapp = require('./routes/members');

var app = express();
 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexapp);
app.use('/users', usersapp);
app.use('/members', membersapp)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
