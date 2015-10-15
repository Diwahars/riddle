/**
 * Created by shuding on 10/10/15.
 * <ds303077135@gmail.com>
 */

var fs = require('fs');

module.exports.all = function (req, res) {
    res.render('admin-settings', {
        title:   config.title,
        user:    req.user,
        page:    'settings',
        message: req.flash('message'),
        data:    {
            lang:  config.lang,
            title: config.title
        }
    });
};

module.exports.save = function (req, res) {
    var modified = false;
    if (req.body.title) {
        config.title = req.body.title;
        modified = true;
    }
    if (['zh', 'en'].indexOf(req.body.lang) !== -1) {
        config.lang = req.body.lang;
        modified = true;
    }
    if (modified) {
        fs.writeFileSync(__dirname + '/../../config.json', JSON.stringify(config));
    }
    req.flash('message', 'Settings updated successfully.');
    res.redirect('/admin/settings');
};
