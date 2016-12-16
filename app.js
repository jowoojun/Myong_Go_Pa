var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var mongoose   = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var aws = require('aws-sdk');
var S3_BUCKET = process.env.S3_BUCKET;


var routes = require('./routes/index');
var users = require('./routes/users');
var rests = require('./routes/rests');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}
app.locals.moment = require('moment');


mongoose.connect('mongodb://myonggi:myonggi123@ds119598.mlab.com:19598/myong_go_pa');
mongoose.connection.on('error', console.log);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride('_method', {methods: ['POST', 'GET']}));

// 세션 설정
app.use(session({
  secure: true,
  resave: true,
  saveUninitialized: true,
  secret: 'asflknwlaern@lnfliunsdf*$^!@*#&$&!%@#kjbfdsliubfsdf',
  
}));

// flash
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());

// bower 설정
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(path.join(__dirname, '/bower_components')));

// 세션및 플레시 지역변수 설정
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.flashMessages = req.flash();
  next();
});

// 라우터 경로 설정
app.use('/', routes);
app.use('/users', users);
app.use('/rests', rests);

// 아마존 이미지
app.get('/s3', function(req, res, next) {
  var s3 = new aws.S3({region: 'ap-northeast-2'});
  var filename = req.query.filename;
  var type = req.query.type;
  
  s3.getSignedUrl('putObject', {
    Bucket: S3_BUCKET,
    Key: filename,
    Expires: 900,
    ContentType: type,
    ACL: 'public-read'
  }, function(err, data) {
    if (err) {
      console.log(err);
      return res.json({err: err});
    }
    
    res.json({
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${filename}`
    });
  });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;