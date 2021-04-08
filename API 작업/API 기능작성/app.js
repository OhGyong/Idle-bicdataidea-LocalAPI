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

require('./setting/anno_crawling.js');

var app = express();

// request body undefined 에러 처리
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//routes 파일 호출
var membersapp = require('./routes/members');
var adminsapp = require('./routes/admins');

app.use('/members', membersapp);
app.use('/admins', adminsapp);


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
