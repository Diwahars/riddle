var express  = require('express');
var router   = express.Router();
var passport = require('passport');

var config = require('../config');

var Quiz   = require('../models/quiz');
var User   = require('../models/user');
var Group  = require('../models/group');
var Record = require('../models/record');

/* GET home page. */
router.get('/', function (req, res, next) {
    if (!req.user || !req.user.gid) {
        res.render('index', {
            title:   config.title,
            user:    req.user,
            data:    [],
            success: req.flash('success'),
            error:   req.flash('error')
        });
    } else {
        Group.findById(req.user.gid, function (err, group) {
            if (err) {
                next(err);
            } else {
                Quiz.find({
                    $or: [{
                        _id: {
                            $in: group.passed
                        }
                    }, {
                        start: true
                    }]
                }, 'title content', function (err, quizzes) {
                    if (err) {
                        next(err);
                    } else {
                        res.render('index', {
                            title:   config.title,
                            user:    req.user,
                            data:    quizzes,
                            success: req.flash('success'),
                            error:   req.flash('error')
                        });
                    }
                });
            }
        });
    }
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
        return next(new Error('Not authorized, permission denied ;)'));
    } else {
        if (!req.body.qid || !req.body.key) {
            return next(new Error(__('Quiz id error or empty key!')));
        }
        if (!req.user.gid) {
            return next(new Error(__('Please join a group ;)')));
        }
        try {
            var record = new Record({
                submit: String(req.body.result),
                uid:    req.user._id,
                gid:    req.user.gid
            });
        } catch (err) {
            return next(err);
        }
        Quiz.findById(req.body.qid, function (err, quiz) {
            if (err) {
                return next(err);
            } else {
                Group.findById(req.user.gid, function (err, group) {
                    if (err) {
                        return next(err);
                    } else {
                        if (group.passed.indexOf(req.body.qid) !== -1 || quiz.start) {
                            var nextId = '';
                            quiz.next.forEach(function (sibling) {
                                if (sibling.key.toString() === String(req.body.key || '')) {
                                    nextId = sibling.id;
                                }
                            });
                            if (nextId) {
                                // passed
                                if (group.passed.indexOf(nextId) !== -1) {
                                    record.result = 'Accepted (again)';
                                    record.save(function () {
                                        req.flash('success', __('Accepted, you\' already passed this level'));
                                        res.redirect('/');
                                    });
                                } else {
                                    record.result = 'Accepted';
                                    record.save(function () {
                                        group.passed.push(nextId);
                                        group.save(function () {
                                            req.flash('success', __('Accepted'));
                                            res.redirect('/');
                                        });
                                    });
                                }
                            } else {
                                record.result = 'Wrong Answer';
                                record.save(function () {
                                    req.flash('error', __('Wrong Answer'));
                                    res.redirect('/');
                                });
                            }
                        } else {
                            record.result = 'Permission Denied';
                            record.save(function () {
                                req.flash('error', __('You do not have permission to access this quiz'));
                                res.redirect('/');
                            });
                        }
                    }
                });
            }
        });
    }
});

module.exports = router;
