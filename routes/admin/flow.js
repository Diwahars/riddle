/**
 * Created by shuding on 10/11/15.
 * <ds303077135@gmail.com>
 */

var mongoose = require('mongoose');

var config = require('../../config.json');
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
