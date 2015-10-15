/**
 * Created by shuding on 10/13/15.
 * <ds303077135@gmail.com>
 */

var mongoose = require('mongoose');

var Group  = require('../../models/group');
var User   = require('../../models/user');
var Quiz   = require('../../models/quiz');

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
                data:     groups,
                quizName: quizNameCache,
                success:  req.flash('success'),
                error:    req.flash('error')
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
        group.save(function (err, group) {
            if (err) {
                next(err);
            } else {
                req.flash('success', 'Group added');
                res.redirect('/admin/groups');
                groupNameCache[group._id] = group.name;
            }
        });
    }
};

module.exports.remove = function (req, res, next) {
    if (!req.body.gid) {
        req.flash('error', 'Group not exist.');
        res.redirect('/');
    } else {
        Group.findByIdAndRemove(req.body.gid, function (err, group) {
            if (err) {
                next(err);
            } else {
                if (group) {
                    User.update({gid: req.body.gid}, {gid: ''}, function () {
                        req.flash('success', 'Group removed');
                        res.redirect('/admin/groups');
                    });
                } else {
                    res.redirect('/');
                }
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
                        title:   config.title,
                        user:    req.user,
                        page:    'groups',
                        success: req.flash('success'),
                        error:   req.flash('error'),
                        data:    {
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
                User.findOneAndUpdate({
                    username: req.body.username,
                    gid:      ''
                }, {gid: group._id}, function (err, user) {
                    if (err) {
                        next(err);
                    } else {
                        if (user) {
                            req.flash('success', 'User added');
                        } else {
                            req.flash('error', 'User not exist or this user is in another group');
                        }
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
        res.redirect('/admin/groups');
    } else if (!req.body.uid) {
        req.flash('error', 'Wrong user id.');
        res.redirect('/admin/groups');
    } else {
        Group.findById(req.body.gid, function (err, group) {
            if (err) {
                next(err);
            } else {
                User.findByIdAndUpdate(req.body.uid, {gid: ''}, function (err, user) {
                    if (err) {
                        next(err);
                    } else {
                        if (user) {
                            req.flash('success', 'User removed');
                        }
                        res.redirect('/admin/groups/' + group._id);
                    }
                });
            }
        });
    }
};

module.exports.lock = function (req, res, next) {
    if (!req.body.gid) {
        req.flash('error', 'Wrong group.');
        res.redirect('/admin/groups');
    } else {
        var date = new Date();
        date.setHours(date.getHours() + 1);
        Group.findByIdAndUpdate(req.body.gid, {lock: date}, function (err) {
            if (err) {
                next(err);
            } else {
                req.flash('success', 'Group locked');
                res.redirect('/admin/groups/');
            }
        });
    }
};

module.exports.unlock = function (req, res, next) {
    if (!req.body.gid) {
        req.flash('error', 'Wrong group.');
        res.redirect('/admin/groups');
    } else {
        var date = new Date(0);
        Group.findByIdAndUpdate(req.body.gid, {lock: date}, function (err) {
            if (err) {
                next(err);
            } else {
                req.flash('success', 'Group unlocked');
                res.redirect('/admin/groups/');
            }
        });
    }
};
