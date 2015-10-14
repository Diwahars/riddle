/**
 * Created by shuding on 10/13/15.
 * <ds303077135@gmail.com>
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Group = new Schema({
    name:   {
        type:    String,
        default: ''
    },
    passed: {
        type:    [String],
        default: []
    },
    lock:   {
        type:    Date,
        default: new Date(0)
    }
});

module.exports = mongoose.model('Group', Group);
