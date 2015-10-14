/**
 * Created by shuding on 10/10/15.
 * <ds303077135@gmail.com>
 */

var mongoose = require('mongoose');

var config = require('../../config.json');
var User   = require('../../models/user');
var Group  = require('../../models/group');

module.exports.pages = function (req, res, next) {
    var offset     = req.query.p || 0;
    var sortMethod = 'group';
    if (['username', 'group', '_id', 'gid', 'name', 'uid', 'school'].indexOf(req.query.s) >= 0) {
        sortMethod = req.query.s;
    }
    User.count(function (err, count) {
        if (err) {
            next(err);
        } else {
            User.find().sort(sortMethod).skip(offset * config['items-per-page']).limit(config['items-per-page']).exec(function (err, users) {
                if (err) {
                    next(err);
                } else {
                    res.render('admin-users', {
                        ObjectId: mongoose.Types.ObjectId,
                        title:    config.title,
                        user:     req.user,
                        page:     'users',
                        data:     {
                            page:         offset,
                            users:        users,
                            usersPerPage: config['items-per-page'],
                            total:        count,
                            sort:         sortMethod,
                            groupName:    groupNameCache
                        }
                    });
                }
            });
        }
    });
};
