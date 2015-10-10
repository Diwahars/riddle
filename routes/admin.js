var express = require('express');
var router  = express.Router();

var config = require('../config.json');

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.render('admin', {
        title: config.title,
        user:  req.user,
        page:  'status'
    });
});

router.get('/users', function (req, res, next) {
    res.render('admin', {
        title: config.title,
        user:  req.user,
        page:  'users'
    });
});

router.get('/quizzes', function (req, res, next) {
    res.render('admin', {
        title: config.title,
        user:  req.user,
        page:  'quizzes'
    });
});

router.get('/settings', function (req, res, next) {
    res.render('admin', {
        title: config.title,
        user:  req.user,
        page:  'settings'
    });
});

module.exports = router;
