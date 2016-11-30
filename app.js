var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var admin = require('firebase-admin'); // Firebase Admin SDK
var serviceAccount = require('./serviceAccountKey.json'); // Service Account

// Initialize Firebase SDK as an Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'testzoltura.firebaseio.com'
});

var index = require('./routes/index');

var config = require('./config');

var app = express();

var itemCtrl = require('./controllers/item');
var userCtrl = require('./controllers/user');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Routing
app.use('/', index);

// Start to Index Firebase Data
itemCtrl.indexItem();
userCtrl.indexUser();

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
