var express = require('express');
var router  = express.Router();

var status = require('./admin/status');
var users = require('./admin/users');
var quizzes = require('./admin/quizzes');
var settings = require('./admin/settings');

router.get('/', status);
router.get('/users', users.pages);
router.get('/quizzes', quizzes.pages);
router.get('/quizzes/new', quizzes.getNew);
router.get('/quizzes/:id', quizzes.id);
router.get('/settings', settings);

router.post('/quizzes/new', quizzes.postNew);

module.exports = router;
