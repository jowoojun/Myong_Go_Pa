var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    owner_id : {type:String, required:true},
    owner_name : {type:String, required:true},
    title: {type: String, required: true, trim: true},
    description: {type: String, trim: true},
    facilities : {type: String, trim: true},
    city: {type: String, required: true, index: true},
    post_number:{type: String, required:true, index:true},
    address: {type: String, required: true},
    reply_count : {type:Number, default:0},
    filePath: {type: String, trim:true},
});

var Cafe = mongoose.model('Cafe', schema);

module.exports = Cafe;