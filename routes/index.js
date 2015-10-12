var express  = require('express');
var router   = express.Router();
var passport = require('passport');

var config = require('../config');

var Quiz = require('../models/quiz');
var User = require('../models/user');
var Record = require('../models/record');

/* GET home page. */
router.get('/', function (req, res, next) {
    Quiz.find({start: true}, 'title content', function (err, quizzes) {
        if (err) {
            next(err);
        } else {
            res.render('index', {
                title: config.title,
                user:  req.user,
                data:  quizzes
            });
        }
    });
});

router.get('/quiz/:id', function (req, res, next) {
    Quiz.findById(req.params.id, 'title content', function (err, quiz) {
        if (err) {
            next(err);
        } else {
            res.render('quiz', {
                title: config.title,
                user:  req.user,
                data:  quiz
            });
        }
    })
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

router.post('/key', function (req, res, next) {
    if (!req.user) {
        next(new Error('Not authorized, permission denied ;)'));
    } else {
        try {
            var record = new Record({
                submit: String(req.body.result),
                uid: req.user._id
            });
        } catch (err) {
            next(err);
        }

    }
});

module.exports = router;
