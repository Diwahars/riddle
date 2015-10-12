/**
 * Created by shuding on 10/10/15.
 * <ds303077135@gmail.com>
 */

var config = require('../../config.json');
var User   = require('../../models/user');
var Quiz   = require('../../models/quiz');

module.exports = function (req, res, next) {

    User.count(function (err, count) {
        if (err) {
            next(err);
        } else {
            Quiz.count(function (err, qcount) {
                res.render('admin-status', {
                    title: config.title,
                    user:  req.user,
                    page:  'status',
                    data: {
                        userCount: count,
                        quizCount: qcount
                    }
                });
            });
        }
    });
};
