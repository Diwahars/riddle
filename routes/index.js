var express  = require('express');
var router   = express.Router();
var passport = require('passport');
var i18n     = require('i18n');

var Quiz   = require('../models/quiz');
var User   = require('../models/user');
var Group  = require('../models/group');
var Record = require('../models/record');

global.userNameCache  = {};
global.quizNameCache  = {};
global.groupNameCache = {};
global.keyCache = [];

User.find(function (err, users) {
    if (!err) {
        users.forEach(function (user) {
            userNameCache[user._id] = user.username;
        });
    }
});

Quiz.find(function (err, quizzes) {
    if (!err) {
        quizzes.forEach(function (quiz) {
            quizNameCache[quiz._id] = quiz.title;
            quiz.next.forEach(function (ne) {
                keyCache.push(ne.key);
            });
        });
    }
});

Group.find(function (err, groups) {
    if (!err) {
        groups.forEach(function (group) {
            groupNameCache[group._id] = group.name;
        });
    }
});

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
                            $in: group ? group.passed : []
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
                            group:   group,
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
    if (!req.user || !req.user.gid) {
        req.flash('error', i18n.__('Please join a group first'));
        res.redirect(config.path + '/');
    } else {
        Group.findById(req.user.gid, function (err, group) {
            if (err) {
                return next(err);
            }
            Quiz.findById(req.params.id, 'title content start', function (err, quiz) {
                if (err) {
                    return next(new Error(':)'));
                }
                if (quiz.start || group.passed.indexOf(quiz._id.toString()) !== -1) {
                    res.render('quiz', {
                        title: config.title,
                        user:  req.user,
                        data:  quiz
                    });
                } else {
                    next(new Error('Unknown'));
                }
            });
        });
    }
});

router.get('/register', function (req, res) {
    res.render('register', {
        title: config.title,
        user:  req.user
    });
});

router.post('/register', function (req, res, next) {
    User.register(new User({
        username: req.body.username,
        name:     req.body.name,
        uid:      req.body.uid,
        school:   req.body.school,
        contact:  req.body.contact
    }), req.body.password, function (err, user) {
        if (err) {
            res.render('register', {
                title:   config.title,
                user:    req.user,
                message: err.message
            });
        } else {
            req.flash('success', 'Successfully registered.');
            res.redirect(config.path + '/');
            userNameCache[user._id] = user.username;
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
    successRedirect: config.path + '/',
    failureRedirect: config.path + '/login',
    failureFlash:    'Invalid username or password.'
}), function (req, res) {
    res.redirect(config.path + '/');
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect(config.path + '/');
});

router.post('/key', function (req, res, next) {
    if (!req.user) {
        return next(new Error(i18n.__('Not authorized, permission denied ;)')));
    } else {
    	var h = (new Date()).getHours();
    	if (config['lock-time-start'] < config['lock-time-end']) {
    		if (config['lock-time-start'] <= h && h < config['lock-time-end']) {
    			req.flash('error', i18n.__('Sorry, system not open at present.'));
				res.redirect(config.path + '/');
				return;
    		}
    	} else {
			if (config['lock-time-start'] <= h || h < config['lock-time-end']) {
    			req.flash('error', i18n.__('Sorry, system not open at present.'));
				res.redirect(config.path + '/');
				return;
    		}
    	}
        if (!req.body.qid || !req.body.key) {
            return next(new Error(i18n.__('Quiz id error or empty key!')));
        }
        if (!req.user.gid) {
            return next(new Error(i18n.__('Please join a group ;)')));
        }
        try {
            var record = new Record({
                submit: String(req.body.key),
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
                        // Is this group locked?
                        if (group.lock > new Date()) {
                            req.flash('error', i18n.__('Sorry your group has been locked.'));
                            res.redirect(config.path + '/');
                            return;
                        }
                        // Validate
                        if (group.passed.indexOf(req.body.qid) !== -1 || quiz.start) {
                            var nextId = [];
                            quiz.next.forEach(function (sibling) {
                                if (sibling.key.toString() === String(req.body.key || '')) {
									nextId.push(sibling.id);
                                }
                            });
                            if (nextId.length == 1) {
                                // passed
                                if (group.passed.indexOf(nextId[0]) !== -1) {
                                    record.result = 'Accepted (again)';
                                    record.save(function () {
										req.flash('success', i18n.__('Accepted, you\' already passed this level'));
                                        res.redirect(config.path + '/');
                                    });
                                } else {
                                    record.result = 'Accepted';
                                    record.save(function () {
                                        group.passed.push(nextId[0]);
                                        group.save(function () {
                                            req.flash('success', i18n.__('Accepted'));
                                            res.redirect(config.path + '/');
                                        });
                                    });
                                }
							} else if (nextId.length > 1) {
								record.result = 'Accepted (unlock ' + nextId.length + ' levels)';
								record.save(function () {
									nextId.forEach(function (id) {
										if (group.passed.indexOf(id) == -1) {
											group.passed.push(id);
										}
									});
									group.save(function () {
										req.flash('success', i18n.__('Accepted'));
										res.redirect(config.path + '/');
									});
								});
                            } else {
                                if (keyCache.indexOf(req.body.key) !== -1) {
                                    // Cheat!
                                    var date = new Date();
                                    if (!group.lock_times) {
                                        group.lock_times = 1;
                                    } else {
                                        group.lock_times++;
                                    }
                                    date.setHours(date.getHours() + group.lock_times * group.lock_times);
                                    group.lock = date;
                                    group.save(function () {
                                        record.result = 'Cheat, lock ' + group.lock_times * group.lock_times + 'hr(s)';
                                        record.save(function () {
                                            req.flash('error', i18n.__('You cheat!'));
                                            res.redirect(config.path + '/');
                                        });
                                    });
                                } else {
                                    record.result = 'Wrong Answer';
                                    record.save(function () {
                                        req.flash('error', i18n.__('Wrong Answer'));
                                        res.redirect(config.path + '/');
                                    });
                                }
                            }
                        } else {
                            record.result = 'Permission Denied';
                            record.save(function () {
                                req.flash('error', i18n.__('You do not have permission to access this quiz'));
                                res.redirect(config.path + '/');
                            });
                        }
                    }
                });
            }
        });
    }
});

module.exports = router;
