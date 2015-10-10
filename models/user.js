/**
 * Created by shuding on 10/10/15.
 * <ds303077135@gmail.com>
 */
var mongoose              = require('mongoose');
var Schema                = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    group: {
        type: String,
        default: 'user'
    }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
