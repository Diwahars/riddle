/**
 * Created by shuding on 10/13/15.
 * <ds303077135@gmail.com>
 */

var mongoose = require('mongoose');

var config = require('../../config.json');
var Group  = require('../../models/group');
var User   = require('../../models/user');

module.exports.all = function (req, res, next) {
    Group.find(function (err, groups) {
        if (err) {
            next(err);
        } else {
            res.render('admin-groups', {
                ObjectId: mongoose.Types.ObjectId,
                title:    config.title,
                user:     req.user,
                page:     'groups',
                data:     groups
            });
        }
    });
};

module.exports.getNew = function (req, res) {
    res.render('admin-groups-new', {
        title:   config.title,
        user:    req.user,
        page:    'groups',
        success: req.flash('success')
    });
};

module.exports.postNew = function (req, res, next) {
    if (!req.body.groupname) {
        req.flash('error', 'Empty group name.');
        res.redirect('/');
    } else {
        var group = new Group({
            name:   req.body.groupname,
            passed: []
        });
        group.save(function (err) {
            if (err) {
                next(err);
            } else {
                req.flash('success', 'Group added');
                res.redirect('/admin/groups');
            }
        });
    }
};

module.exports.update = function (req, res, next) {
    if (!req.body.groupname) {
        req.flash('error', 'Empty group name.');
        res.redirect('/');
    } else {
        Group.findByIdAndUpdate(req.body.gid, {name: req.body.groupname}, function (err, group) {
            if (err) {
                next(err);
            } else {
                req.flash('success', 'Group updated');
                res.redirect('/admin/groups/' + group._id);
            }
        });
    }
};

module.exports.id = function (req, res, next) {
    if (!req.params.id) {
        req.flash('error', 'Empty group name.');
        res.redirect('/');
    } else {
        Group.findById(req.params.id, function (err, group) {
            if (err) {
                next(err);
            } else {
                User.find({gid: group._id}, function (err, users) {
                    res.render('admin-groups-new', {
                        title: config.title,
                        user:  req.user,
                        page:  'groups',
                        data:  {
                            group: group,
                            users: users
                        }
                    });
                });
            }
        });
    }
};

module.exports.addUser = function (req, res, next) {
    if (!req.body.gid) {
        req.flash('error', 'Wrong group.');
        res.redirect('/');
    } else if (!req.body.username) {
        req.flash('error', 'Wrong username.');
        res.redirect('/');
    } else {
        Group.findById(req.body.gid, function (err, group) {
            if (err) {
                next(err);
            } else {
                User.findOneAndUpdate({username: req.body.username}, {gid: group._id}, function (err) {
                    if (err) {
                        next(err);
                    } else {
                        req.flash('success', 'User added');
                        res.redirect('/admin/groups/' + group._id);
                    }
                });
            }
        });
    }
};

module.exports.removeUser = function (req, res, next) {
    if (!req.body.gid) {
        req.flash('error', 'Wrong group.');
        res.redirect('/');
    } else if (!req.body.uid) {
        req.flash('error', 'Wrong user id.');
        res.redirect('/');
    } else {
        Group.findById(req.body.gid, function (err, group) {
            if (err) {
                next(err);
            } else {
                User.findOneAndUpdate({username: req.body.username}, {gid: group._id}, function (err) {
                    if (err) {
                        next(err);
                    } else {
                        req.flash('success', 'User added');
                        res.redirect('/admin/groups/' + group._id);
                    }
                });
            }
        });
    }
};
