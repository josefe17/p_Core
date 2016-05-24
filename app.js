var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var bodyParser = require('body-parser');
var partials = require('express-partials');
var flash = require ('express-flash');
var methodOverride=require('method-override');
var routes = require('./routes/index');

var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(partials());

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: "Quiz 2016",
                 resave: false,
                 saveUninitialized: true }));
app.use(methodOverride('_method', {methods: ["POST", "GET"]}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use(function(req, res, next){
  res.locals.session=req.session;
  next();
});


app.use(function(req, res, next){
  if (!res.locals.session.user) next(); //Si no hay nadie logueado
  else {
        var timeout = 120000;
        timeout = 7500; //Debug
        var prev_time_ms = res.locals.session.user.prev_time || (new Date()).getTime();
        if (((new Date()).getTime() - prev_time_ms)<timeout){
          res.locals.session.user.prev_time = (new Date()).getTime(); 
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Reset timeout: " + res.locals.session.user);         
        }
        else{ 
          res.locals.session.user=null;
          console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Logging out: " + res.locals.session.user);
          }
        next();        
    }
});

app.use('/', routes);


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
