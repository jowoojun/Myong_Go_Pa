var express = require('express'),
    User = require('../models/User');
    Rest = require('../models/Rest');
    Post = require('../models/Post');
    Favorite = require('../models/Favorite');
    
var router = express.Router();

function needAuth(req, res, next) {
    if (req.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('back');
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
    var page = Math.max(1, req.query.page);
    var limit = 5;
    var skip = (page - 1) * limit;
    
    Rest.count({}, function(err, count){
        if(err){
            return console.log(err);
        }
        var pagination = Pagination(count, limit, page);

        Rest.find().skip(skip).limit(limit).exec(function(err, rests) {
            if (err) {
                return console.log(err);
            }
            
            res.render('rest/list', {rests:rests, pagination:pagination});
        });
    }); 
});


// 식당 상세정보 페이지
router.get('/:id', function(req,res,next){
  Rest.findById(req.params.id, function(err, rest) {
    if(err){
        return next(err);
    } else {
        rest.meta.views++;
        rest.save(function(err){
            if(err){
                return next(err);
            }
        });
        Menu.find({rest_id : req.params.id}, function(err, menus){
            Post.find({rest_id : req.params.id}, function(err, posts){
                res.render('rest/restaurant', {rest:rest, posts:posts, menus:menus});
            });
        });
    }
  });
});


// 후기남기기 + 평점 계산 로직
router.post('/post/:id',needAuth,function(req,res) {
  Rest.update({_id:req.params.id}, {$inc: {"reply_count" : 1}}, function(err, result){
    if(!req.user.id){
        req.flash('danger', '로그인을 해주세요.');
        res.redirect('back');
    } else {
        User.findById(req.user.id, function(err,user){
            Rest.findById(req.params.id, function(err, Rest){
                //이용자 별점을 integer로 형변환 
                //console.log('현재 포인트' + Rest.meta.point);
                if(Rest.meta.point === 0){
                    Rest.meta.point = parseInt(req.body.point);
                    //console.log('0포인트일때 첫 평점 매긴다면? ' + Rest.meta.point);
                } else {
                    Rest.meta.point = (Rest.meta.point + parseInt(req.body.point))/2;
                    //console.log('로직 후 포인트 평점' + Rest.meta.point);
                }
                Rest.save(function(err){
                    if(err){
                        return res.send(err);
                    }
                });
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
    }
    
  });
});

// 즐겨찾기
router.get('/:id/Favorite',needAuth,function(req,res) {
  if(!req.user.id){
    req.flash('danger', '로그인을 해주세요.');
    res.redirect('back');
  } else {
    Rest.findById(req.params.id, function(err, Rest){
        if(err){
            return res.send(err);
        } else {
            Rest.meta.favs++;
            Rest.save(function(err){
                if(err){
                    return res.send(err);
                }
            });
            
            User.findById(req.user.id, function(err,user){
                
                var newFavorite = new Favorite({
                    rest_id: req.params.id,
                    user_id: req.user.id,
                    title : Rest.title,
                });  
                console.log(newFavorite);
                newFavorite.save(function(err){
                    if (err) {
                    res.send(err);
                    } else {
                    req.flash('success', 'Favorite 목록에 추가되었습니다.');
                    res.redirect('back');
                    }
                });
            });
        }
    });
  }
});



module.exports = router;
