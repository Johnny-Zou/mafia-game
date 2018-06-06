var express = require('express');
var router = express.Router();

router.get('/',function(req,res,next){
    res.render('index.html');
});

router.get('/join',function(req,res,next){
	res.render('joinGame.html');
})

router.get('/create',function(req,res,next){
	res.render('createGame.html');
})

router.get('/lobby',function(req,res,next){
	res.render('lobby.html');
})

module.exports = router;