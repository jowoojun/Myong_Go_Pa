var express = require('express'),
    User = require('../models/User');
    Rest = require('../models/Rest');
    Cafe = require('../models/Cafe');

var findOrCreate = require('mongoose-findorcreate');
var pbkdf2Password = require('pbkdf2-password');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var _ = require('lodash');

var router = express.Router();
var hasher = pbkdf2Password();

router.use(passport.initialize());
router.use(passport.session());

var countries = ["폴주니어", "산골식당"];



function validateForm(form, options) {
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

  if (form.password !== form.password_confirmation) {
    return '비밀번호가 일치하지 않습니다.';
  }

  if (form.password.length < 6) {
    return '비밀번호는 6글자 이상이어야 합니다.';
  }

  return null;
}


/* GET home page. */
router.get('/', function(req, res, next) {
  Rest.find({}, function(err, rests){
    res.render('index',{rests:rests});
  });
});

// 로그인 페이지
router.get('/signin', function(req, res, next) {
  res.render('signin');
});

// 검색
router.get('/suggest', function(req, res, next) {
  var search = req.query.search;

  var ret = _.filter(countries, function(name) {
      return name.toLowerCase().indexOf(search.toLowerCase()) > -1;
  });

  res.json(ret);
});

router.post('/search', function(req, res, next) {
    Rest.find({title: req.body.search}, function(err, rests){
      res.render('rest/search', {rests:rests});
    });
});

// passport 및 암호화(hash)를 통한 로그인
// passport 처음에 로그인헀을때 실행 4
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// passport 첫 로그인 이후 3
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    return done(err, user);
  });
});

// passport 규칙에 따라 실행 2
passport.use(new LocalStrategy({ // or whatever you want to use
    usernameField: 'email',    // define the parameter in req.body that passport can use as username and password
    passwordField: 'password'
  },
  function(username, password, done) { // depending on your strategy, you might not need this function ...
      User.findOne({ email:username }, function(err, user) {
        if (err) { 
          return done(err); 
        }
        if (!user) {
          return done(null, false, { message: ('존재하지 않는 사용자 입니다.') });
        }
        return hasher({password:password, salt:user.salt}, function(err, pass, salt, hash){
          if(hash === user.password){
            return done(null, user ,{message: ('로그인 되었습니다.')});
          }else{
            return done(null, false, { message: ('비밀번호가 일치하지 않습니다.')});
          }
        });
      });
  }
));

// passport facebook 규칙에 따라 실행 2
passport.use(new FacebookStrategy({
    clientID: '1775119929415169',
    clientSecret: '24130c62620b41cf3882ae7cbce3f402',
    callbackURL: "/signin/facebook/callback",
    profileFields:['id','email','displayName']
  },
  function(accessToken, refreshToken, profile, done) {
    // profile : 페이스북 상에서의 id가 담겨있다.
    User.findOrCreate({facebook_id: profile.id, name : profile.displayName, email: profile.emails[0].value.trim()}, function(err, user) {
      if (err) { 
        return done(err); 
      }
      done(null, user);
    });
  }
));


// passport local 첫번째로 실행 1
router.post('/signin', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: 'back',
    failureFlash: true
}));

// passport facebook 첫번째로 실행 1
router.get('/signin/facebook',
  passport.authenticate('facebook', { scope: ['email'] })
);

// passport facebook callbackURL로 인증 실행 3
router.get('/signin/facebook/callback',
  passport.authenticate('facebook', { 
    successRedirect: '/',
    failureRedirect: '/signin'  
  }));

// 로그아웃
router.get('/signout', function(req, res, next) {
  req.logout();
  req.flash('success', '로그아웃 되었습니다.');
  res.redirect('/');
});

// 회원가입화면
router.get('/signup', function(req, res, next) {
  res.render('signup', {messages: req.flash()});
});

// 회원가입
router.post('/signup', function(req, res, next) {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', '동일한 이메일 주소가 이미 존재합니다.');
      res.redirect('back');
    }
    
    hasher({password:req.body.password}, function(err, pass, salt, hash){
        var newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password:hash,
          salt: salt
        });

        if(newUser.email === 'root@com')
          newUser.ifRoot = true;

        newUser.save(function(err) {
          if (err) {
            return next(err);
          } else {
            req.flash('success', '가입이 완료되었습니다. 로그인 해주세요.');
            res.redirect('/');
          }
        });
    });
  });
});

module.exports = router;
