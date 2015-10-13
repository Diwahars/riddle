var express = require('express');
var router  = express.Router();

var status   = require('./admin/status');
var users    = require('./admin/users');
var groups    = require('./admin/groups');
var quizzes  = require('./admin/quizzes');
var settings = require('./admin/settings');
var flow     = require('./admin/flow');

router.get('/', status);
router.get('/users', users.pages);
router.get('/groups', groups.all);
router.get('/groups/new', groups.getNew);
router.get('/groups/:id', groups.id);
router.get('/quizzes', quizzes.pages);
router.get('/quizzes/new', quizzes.getNew);
router.get('/quizzes/:id', quizzes.id);
router.get('/flow', flow.sort);
router.get('/settings', settings);

router.post('/quizzes/new', quizzes.postNew);
router.post('/groups/new', groups.postNew);
router.post('/groups/update', groups.update);
router.post('/groups/add', groups.addUser);
router.post('/groups/removeuser', groups.removeUser);
router.post('/quizzes/delete/:id', quizzes.delete);
router.post('/flow/save', flow.save);

module.exports = router;
