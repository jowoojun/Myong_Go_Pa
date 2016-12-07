var express = require('express'),
    User = require('../models/User');
    Rest = require('../models/Rest');
    Cafe = require('../models/Cafe');
    Favorite = require('../models/Favorite');
var pbkdf2Password = require('pbkdf2-password');
var router = express.Router();
var hasher = pbkdf2Password();
var multer = require('multer');
var upload = multer({ dest: '/tmp' });

function needAuth(req, res, next) {
    if (req.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
}

function edit_validateForm(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  name = name.trim();
  email = email.trim();

  if (!name) {
    return '이름을 입력해주세요.';
  }

  if (!email) {
    return '이메일을 입력해주세요.';
  }

  if (!form.password && options.needPassword) {
    return '비밀번호를 입력해주세요.';
  }

  if (form.change_password !== form.password_confirmation) {
    return '비밀번호가 일치하지 않습니다.';
  }

  if (form.change_password.length < 6) {
    return '비밀번호는 6글자 이상이어야 합니다.';
  }

  return null;
}

// GET
// 사용자 목록 화면
router.get('/', needAuth, function(req, res, next) {
    var email = req.user.email.trim();

    if(email === "root@com"){
       User.find({}, function(err, users) {
          if (err) {
            return next(err);
          }
          User.findById(req.user, function(err, user) {
            if (err) {
              return next(err);
            }
            res.render('users/index', {users: users,user:user});
          });
        });
    }
    else{
        res.redirect('../');
    }
});

// 사용자 정보 편집 화면
router.get('/:id/edit', needAuth, function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/edit', {user: user});
  });
});

// 개인 화면
router.get('/:id', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }

    res.render('users/show', {user: user});
  });
});

// 프로필보기
router.get('/:id/profile', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    Post.find({user_id: req.params.id},function(err,posts){
      Favorite.find({user_id: req.params.id}, function(err, favorites){
        if (err) {
          return next(err);
        }

        res.render('users/profile', {user: user, posts: posts, favorites: favorites});
      });
    });
  });
});

// Favorite 화면
router.get('/:id/favorite',needAuth,  function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    Favorite.find({user_id:req.params.id}, function(err, favorites){
      if (err) {
        return next(err);
      }

      res.render('users/favorite', {user:user, favorites:favorites});
    });
  });
});

// 호스트 되기 화면
router.get('/:id/host',needAuth,  function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    
    res.render('users/host', {user: user});
  });
});

// 식당등록화면
router.get('/:id/register', needAuth,  function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    
    res.render('users/register', {user: user});
  });
});

// 식당정보화면
router.get('/:id/rests', needAuth, function(req, res, next) {
  User.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    Rest.find({owner_id: user._id},function(err, rests){
      res.render('users/rests', {user: user, rests:rests});
    });
  });
});

// POST
// 호스트 등록
router.post('/:id', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }

    user.ifHost = true;
    
    user.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', 'Host로 등록되셨습니다.');
        res.redirect('/');
      }
    });
  });
});

// 식당등록
router.post('/:id/register', upload.single("file"), function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    
    var newRest = new Rest({
      owner_id: req.params.id,
      owner_name: user.name,
      title: req.body.title,
      description: req.body.description,
      post_number:req.body.post_number,
      address: req.body.address,
      category: req.body.category,
      filePath : req.body.url
    }); 

    newRest.save(function(err) {
      if (err) {
        req.flash('danger',err);
        res.redirect('back');
      } else {
        req.flash('success', '새로운 식당이 등록되었습니다.');
        res.redirect('/');
      }
    });
  });
});


// PUT
// 사용자 정보변경
router.put('/:id', function(req, res, next) {
  var err = edit_validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('/');
  }

  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('danger', '존재하지 않는 사용자입니다.');
      return res.redirect('back');
    }
    hasher({password:req.body.password, salt:user.salt}, function(err, pass, salt, hash){
      if(err){
        console.log(err);
      }
      if(hash === user.password){
          return hasher({password:req.body.change_password}, function(err, pass, salt, hash){
              if(err){
                console.log(err);
              }

              User.update({_id: req.params.id}, {$set:{
                name : req.body.name,
                email : req.body.email,
                password : hash,
                salt : salt,
              }},function(err, results) {
                if (err) {
                  return console.log(err);
                }else{
                  req.flash('success', '사용자 정보가 변경되었습니다.');
                  res.redirect('/');
                }
              });
          });
      }else{
          req.flash('danger', '현재 비밀번호가 일치하지 않습니다.');
          return res.redirect('back');
      }
    });
  });
});

// DELETE
// 사용자 삭제
router.delete('/:id', function(req, res, next) {
  req.logout();
  User.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', '사용자 계정이 삭제되었습니다.');
    res.redirect('/');
  });
});

// favorite 삭제
router.delete('/:id/favorite', function(req, res) {
    Favorite.findOneAndRemove({_id: req.params.id}, function(err) {
        if (err) {
            return console.log(err);
        }
        req.flash('success', 'favorite를 삭제했습니다.');
        res.redirect('back');
    });
});

// rest 삭제
router.delete('/:id/rest', function(req, res) {
    Rest.findOneAndRemove({_id: req.params.id}, function(err) {
        if (err) {
            return console.log(err);
        }
        req.flash('success', '식당을 삭제했습니다.');
        res.redirect('back');
    });
});
module.exports = router;