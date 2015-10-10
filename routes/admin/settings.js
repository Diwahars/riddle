/**
 * Created by shuding on 10/10/15.
 * <ds303077135@gmail.com>
 */

var config = require('../../config.json');

module.exports = function (req, res, next) {
    res.render('admin', {
        title: config.title,
        user:  req.user,
        page:  'settings'
    });
};
