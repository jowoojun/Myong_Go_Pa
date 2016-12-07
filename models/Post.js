// mongoose 모듈과 mongoose의 Schma 메소드를 사용
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// 몽고DB에 스키마를 생성
var schema = new Schema({
    rest_id:{type:String},
    cafe_id:{type:String},
    hostname:{type:String, required:true},
    user_id:{type:String, required:true},
    user_name: {type: String, required:true},
    content: {type: String, required:true},
    createdAt: {type: Date, default: Date.now}}, {
    toJSON: { virtuals: true},
    toObject: {virtuals: true}
});

// 생성한 스키마를 Post라는 모델로 저장하고 Post변수에 저장
var Post = mongoose.model('Post', schema);
// Post를 모듈로 추출한다.
module.exports = Post;