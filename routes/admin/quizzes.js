/**
 * Created by shuding on 10/10/15.
 * <ds303077135@gmail.com>
 */

var mongoose = require('mongoose');

var config = require('../../config.json');
var Quiz   = require('../../models/quiz');

module.exports.pages = function (req, res, next) {
    var offset     = req.query.p || 0;
    var sortMethod = 'title';
    if (['title', '_id'].indexOf(req.query.s) >= 0) {
        sortMethod = req.query.s;
    }
    Quiz.count(function (err, count) {
        if (err) {
            next(err);
        } else {
            Quiz.find().sort(sortMethod).skip(offset * config['items-per-page']).limit(config['items-per-page']).exec(function (err, quizzes) {
                if (err) {
                    next(err);
                } else {
                    res.render('admin-quizzes', {
                        ObjectId: mongoose.Types.ObjectId,
                        title:    config.title,
                        user:     req.user,
                        page:     'quizzes',
                        message:  req.flash('success'),
                        data:     {
                            page:           offset,
                            quizzes:        quizzes,
                            quizzesPerPage: config['items-per-page'],
                            total:          count,
                            sort:           sortMethod
                        }
                    });
                }
            });
        }
    });
};

module.exports.id = function (req, res, next) {
    Quiz.findById(req.params.id, function (err, quiz) {
        if (err) {
            next(err);
        } else {
            res.render('admin-quizzes-new', {
                title:   config.title,
                user:    req.user,
                page:    'quizzes',
                data:    quiz,
                message: req.flash('success')
            });
        }
    });
};

module.exports.getNew = function (req, res, next) {
    res.render('admin-quizzes-new', {
        title: config.title,
        user:  req.user,
        page:  'quizzes'
    });
};

module.exports.postNew = function (req, res, next) {
    if (req.body.title && req.body.title.length) {
        if (req.body.id) {
            // Update
            Quiz.findOneAndUpdate({_id: req.body.id}, {
                title:   req.body.title,
                content: req.body.content || ''
            }, function (err, quiz) {
                if (err) {
                    next(err);
                } else {
                    req.flash('success', 'Quiz saved.');
                    res.redirect('/admin/quizzes/' + quiz._id);
                }
            });
        } else {
            // Create
            var quiz = new Quiz({
                title:   req.body.title,
                content: req.body.content || ''
            });
            quiz.save(function (err, quiz) {
                if (err) {
                    next(err);
                } else {
                    req.flash('success', 'Quiz created.');
                    res.redirect('/admin/quizzes/');
                    quizNameCache[quiz._id] = quiz.title;
                }
            });
        }
    } else {
        next(new Error('Missing title'));
    }
};

module.exports.delete = function (req, res, next) {
    Quiz.findOneAndRemove({_id: req.params.id}, function (err) {
        if (err) {
            next(err);
        } else {
            Quiz.find(function (err, quizzes) {
                if (err) {
                    next(err);
                } else {
                    quizzes.forEach(function (quiz) {
                        var rm = -1;
                        quiz.next.forEach(function (n, index) {
                            if (n.id == req.params.id) {
                                rm = index;
                            }
                        });
                        if (rm >= 0) {
                            quiz.next.splice(rm, 1);
                            quiz.save(function () {
                            });
                        }
                    });
                }
            });
            req.flash('success', 'Quiz removed.');
            res.redirect('/admin/quizzes/');
        }
    });
};
