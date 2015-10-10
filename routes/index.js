var express  = require('express');
var router   = express.Router();
var passport = require('passport');
var User     = require('../models/user');

var config = require('../config');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', {
        title: config.title,
        user:  req.user
    });
});

router.get('/register', function (req, res) {
    res.render('register', {
        title: config.title,
        user:  req.user
    });
});

router.post('/register', function (req, res, next) {
    User.register(new User({username: req.body.username}), req.body.password, function (err) {
        if (err) {
            res.render('register', {
                title:   config.title,
                user:    req.user,
                message: err.message
            });
        } else {
            res.redirect('/');
        }
    });
});

router.get('/login', function (req, res) {
    res.render('login', {
        title:   config.title,
        user:    req.user,
        message: req.flash('error')
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash:    'Invalid username or password.'
}), function (req, res) {
    res.redirect('/');
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
