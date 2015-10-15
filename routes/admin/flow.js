/**
 * Created by shuding on 10/11/15.
 * <ds303077135@gmail.com>
 */

var mongoose = require('mongoose');

var Quiz   = require('../../models/quiz');

module.exports.sort = function (req, res, next) {
    Quiz.find({}).select('title next start').exec(function (err, quizzes) {
        if (err) {
            next(err);
        } else {
            var quizData = {};
            quizzes.forEach(function (quiz) {
                quizData[quiz._id] = {
                    title: quiz.title,
                    start: quiz.start,
                    next:  quiz.next
                };
            });
            res.render('admin-flow', {
                title: config.title,
                user:  req.user,
                page:  'flow',
                data:  quizData
            });
        }
    });
};

module.exports.save = function (req, res, next) {
    var data = req.body.data;
    try {
        data = JSON.parse(data);
    } catch (err) {
        return next(err);
    }

    var cnt = 0, scopeErr = null;
    keyCache = [];
    for (var id in data) {
        if (data.hasOwnProperty(id)) {
            cnt++;
            if (!scopeErr) {
                data[id].next.forEach(function (ne) {
                    keyCache.push(ne.key);
                });
                Quiz.findByIdAndUpdate(id, {
                    start: data[id].start,
                    next:  data[id].next
                }, function (err) {
                    if (scopeErr) {
                        return;
                    }
                    if (err) {
                        scopeErr = err;
                        next(err);
                    } else {
                        if (--cnt == 0) {
                            req.flash('success', 'Saved successfully!');
                            res.redirect('/admin/quizzes');
                        }
                    }
                });
            }
        }
    }
};
