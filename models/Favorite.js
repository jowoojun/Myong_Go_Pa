var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    rest_id : {type:String},
    user_id : {type:String, required:true},
    
    title : {type:String}
});

var Favorite = mongoose.model('Favorite ', schema);

module.exports = Favorite;