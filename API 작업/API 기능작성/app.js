let express = require('express');
let  bodyParser = require('body-parser');
let createError = require('http-errors');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let dotenv = require('dotenv')
dotenv.config({
  "path" : "./env"
})
require('dotenv').config();


require('./auto_run/anno_crawling.js');
require('./auto_run/member_rank.js');

var app = express();

// 세션 연결
let session = require('./setting/session.js')
app.use(session)

// request body undefined 에러 처리
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//routes 파일 호출
let membersapp = require('./routes/members');
let adminsapp = require('./routes/admins');
let pointsapp = require('./routes/points');
let user_boardsapp = require('./routes/user_boards');
let admin_boardsapp = require('./routes/admin_boards');

app.use('/members', membersapp);
app.use('/admins', adminsapp);
app.use('/points', pointsapp);
app.use('/user_boards', user_boardsapp);
app.use('/admin_boards', admin_boardsapp);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
