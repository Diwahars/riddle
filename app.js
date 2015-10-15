var express       = require('express');
var passport      = require('passport');
var path          = require('path');
var favicon       = require('serve-favicon');
var logger        = require('morgan');
var cookieParser  = require('cookie-parser');
var session       = require('cookie-session');
var bodyParser    = require('body-parser');
var compression   = require('compression');
var flash         = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;
var mongoose      = require('mongoose');
var i18n          = require("i18n");

global.config = require('./config.json');

var User = require('./models/user');

var routes = require('./routes/index');
var admin  = require('./routes/admin');

var app = express();

app.locals.path = config.path;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({keys: ['riddlesecretkey@2015', '5102@yekterceseldder']}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// use static serialize and deserialize of model for passport session support
app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(config.mongodb, function (err) {
    if (err) {
        console.log('Could not connect to mongodb!');
    }
});

i18n.configure({
    locales:   ['en', 'zh'],
    cookie:    'locale',
    directory: __dirname + '/locales'
});

app.use(compression());
app.use(i18n.init);
app.use(function (req, res, next) {
    req.setLocale(config.lang);
    return next();
});
app.use('/', routes);
app.use('/admin', function (req, res, next) {
    if (!req.user || req.user.group !== 'admin') {
        res.status(404);
        res.render('error', {
            title:   config.title,
            user:    req.user,
            message: 'Not Found',
            status:  404
        });
    } else {
        next();
    }
}, admin);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err    = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        title:   config.title,
        user:    req.user,
        message: err.message,
        status:  err.status || 500
    });
});

module.exports = app;
