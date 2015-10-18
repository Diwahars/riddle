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
            title: config.title,
            lts: config['lock-time-start'],
            lte: config['lock-time-end']
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
    if (req.body.lts) {
		config['lock-time-start'] = parseInt(req.body.lts);
		modified = true;
    }
    if (req.body.lte) {
		config['lock-time-end'] = parseInt(req.body.lte);
		modified = true;
    }
    if (modified) {
        fs.writeFileSync(__dirname + '/../../config.json', JSON.stringify(config));
    }
    req.flash('message', 'Settings updated successfully.');
    res.redirect(config.path + '/admin/settings');
};
