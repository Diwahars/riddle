/**
 * Created by shuding on 10/10/15.
 * <ds303077135@gmail.com>
 */
var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Quiz = new Schema({
    title:   {
        type:    String,
        default: 'Untitled'
    },
    content: {
        type:    String,
        default: ''
    },
    next:    {
        type:    [{
            id:  String,
            key: String
        }],
        default: []
    },
    start:   {
        type:    Boolean,
        default: false
    }
});

module.exports = mongoose.model('Quiz', Quiz);
