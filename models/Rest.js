var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    owner_id : {type:String, required:true},
    owner_name : {type:String, required:true},
    title: {type: String, required: true, trim: true},
    description: {type: String, trim: true},
    category : {type: String, trim: true},
    post_number:{type: String, required:true, index:true},
    address: {type: String, required: true},
    reply_count : {type:Number, default:0},
    filePath: {type: String, trim:true},
});

var Rest = mongoose.model('Rest', schema);

module.exports = Rest;