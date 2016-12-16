var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    rest_id : {type:String, required:true},
    name: {type: String, required: true, trim: true},
    price : {type:Number, default:0}
});

var Menu = mongoose.model('Menu', schema);

module.exports = Menu;