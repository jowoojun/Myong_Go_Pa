var express = require('express'),
    User = require('../models/User');
    Rest = require('../models/Rest');
    Cafe = require('../models/Cafe');
    Post = require('../models/Post');
    Favorite = require('../models/Favorite');
var router = express.Router();

function needAuth(req, res, next) {
    if (req.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
}


function Pagination(count, limit, page){
    // 경로를 저장할 변수
    var  url;
    // 마지막 페이지의 번호를 가지는 변수
    var maxPage = Math.ceil(count / limit);
    
    // 모든 페이지들의 정보를 담은 변수
    var pagination = {
        // post들의 갯수를 pagination.numPost에 저장
        numPosts : count,
        // 각각의 페이지의 정보를 담은 변수
        pages : [],
        // 첫 페이지의 정보를 담은 변수
        firstPage : {
            cls : 'firstPage',
            url : '/rests?page=1'
        },
        // 이전 페이지의 정보를 담은 변수
        prevPage : {
            cls : 'prevPage',
            url : url
        },
        // 다음 페이지의 정보를 담은 변수
        nextPage : {
            cls : 'nextPage',
            url : url
        },
        // 마지막 페이지의 정보를 담은 변수
        lastPage : {
            cls : 'lastPage',
            url : '/rests?page='+maxPage
        },
    };

    // 이전 페이지 객체의 내부 변수 설정
    if(!(page)){
        pagination.prevPage.url = '/rests?page=1';
    }else if((page) === 1){
        pagination.prevPage.url = '/rests?page=1';
    }else{
        pagination.prevPage.url = '/rests?page='+(page - 1);
    }

    // 다음 페이지 객체의 내부 변수 설정
    if(!(page)){
        if(maxPage === 1){
            pagination.nextPage.url = '/rests?page=1';
        }else{
            pagination.nextPage.url = '/rests?page=2';
        }
    }else if(parseInt(page) === parseInt(maxPage)){
        pagination.nextPage.url = '/rests?page='+maxPage;
    }else{
        pagination.nextPage.url = '/rests?page='+(page + 1);
    }

    // 반복문을 실행하면서 각각의 페이지 객체의 내부 변수 설정
    for(var i = 0; i < maxPage; i++){
        var data = {
            cls : 'page',
            url : '/rests?page='+(i+1),
            text : i+1
        };
        pagination.pages[i] = data;
    }

    return pagination;
}


// GET
// 식당 목록 페이지
router.get('/', function(req,res,next){
    // 현재 페이지의 쿼리를 받아오는 변수
    var page = Math.max(1, req.query.page);
    // 한 페이지에 몇개의 post를 보여줄 것인가 정하는 변수
    var limit = 5;
    // 화면에 post를 limit갯수만큼 보여줄 때 건너뛸 post의 갯수를 갖는 변수
    var skip = (page - 1) * limit;
    // post들의 갯수를 반환해주는 메소드
    Rest.count({}, function(err, count){
        // err가 발생한 경우 err를 콘솔에 출력한다.
        if(err){
            return console.log(err);
        }
        var pagination = Pagination(count, limit, page);

        // /posts/index페이지에 보여줄 post의 갯수를 limit으로 하고 skip갯수만큼 건너 뛰면서 화면에 보여준다.
        Rest.find().skip(skip).limit(limit).exec(function(err, rests) {
            // post를 찾는 과정에서 에러가 발생하는 경우 err를 콘솔에 출력한다.
            if (err) {
                return console.log(err);
            }
            
            // /posts/index에 posts와 pagination을 매개변수로 넘겨준다.
            res.render('rest/list', {rests:rests, pagination:pagination});
        });
    }); 
});


// 식당 상세정보 페이지
router.get('/:id', function(req,res,next){
  Rest.findById(req.params.id, function(err, rest) {
    Post.find({rest_id : req.params.id}, function(err, posts){
        res.render('rest/restaurant', {rest:rest, posts:posts});
    });
  });
});


// Post
// 후기남기기
router.post('/post/:id',needAuth,function(req,res) {
  Rest.update({_id:req.params.id}, {$inc: {"reply_count" : 1}}, function(err, result){
    User.findById(req.user.id, function(err,user){
      Rest.findById(req.params.id, function(err, Rest){ 
          var newPost = new Post({
              rest_id: req.params.id,
              hostname: Rest.owner_name,
              user_id: req.user.id,
              user_name: user.name,
              content: req.body.content
          });  
          
          newPost.save(function(err){
            if (err) {
              res.send(err);
            } else {
              req.flash('success', '후기를 남겨주셔서 감사합니다.');
              res.redirect('back');
          }
        });
      });
    });
  });
});

// 즐겨찾기
router.post('/:id/Favorite',needAuth,function(req,res) {
  Rest.findById(req.params.id, function(err, Rest){ 
    User.findById(req.user.id, function(err,user){
      var newFavorite = new Favorite({
          Rest_id: req.params.id,
          user_id: req.user.id,
          title : Rest.title,
      });  

      newFavorite.save(function(err){
        if (err) {
          res.send(err);
        } else {
          req.flash('success', 'Favorite 목록에 추가되었습니다.');
          res.redirect('back');
        }
      });
    });
  });
});



module.exports = router;
