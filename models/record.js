/**
 * Created by shuding on 10/12/15.
 * <ds303077135@gmail.com>
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Record = new Schema({
    result: {
        type:    String,
        default: '-'
    },
    uid:    {
        type:    String,
        default: ''
    },
    gid:    {
        type:    String,
        default: ''
    },
    submit: {
        type:    String,
        default: ''
    }
});

module.exports = mongoose.model('Record', Record);
