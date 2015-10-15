/**
 * Created by shuding on 10/10/15.
 * <ds303077135@gmail.com>
 */

var mongoose = require('mongoose');

var User   = require('../../models/user');
var Quiz   = require('../../models/quiz');
var Group  = require('../../models/group');
var Record = require('../../models/record');

module.exports = function (req, res, next) {
    User.count(function (err, count) {
        if (err) {
            return next(err);
        }
        Quiz.count(function (err, qcount) {
            if (err) {
                return next(err);
            }
            Group.count(function (err, gcount) {
                if (err) {
                    return next(err);
                }
                var offset = parseInt(req.query.p) || 0;
                Record.count(function (err, rcount) {
                    Record.find().sort({_id: -1}).skip(offset * config['items-per-page']).limit(config['items-per-page']).exec(function (err, records) {
                        res.render('admin-status', {
                            ObjectId: mongoose.Types.ObjectId,
                            title:    config.title,
                            user:     req.user,
                            page:     'status',
                            data:     {
                                usersPerPage: config['items-per-page'],
                                total:        rcount,
                                page:         offset,
                                userCount:    count,
                                quizCount:    qcount,
                                groupCount:   gcount,
                                records:      records,
                                groupName:    groupNameCache || {},
                                userName:     userNameCache || {}
                            }
                        });
                    });
                });
            });
        });
    });
};
