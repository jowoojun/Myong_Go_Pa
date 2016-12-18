var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var findOrCreate = require('mongoose-findorcreate');

var schema = new Schema({
  name: {type: String, required: true, trim: true},
  email: {type: String, required: true, index: true, unique: true, trim: true},
  password: {type: String},
  salt: {type:String},
  ifHost : {type:Boolean, default:false},
  ifRoot : {type:Boolean, default:false},
  createdAt: {type: Date, default: Date.now},
  facebook_id : {type:String}
});

schema.plugin(findOrCreate);
var User = mongoose.model('User', schema);

module.exports = User;