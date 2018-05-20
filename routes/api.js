var express = require('express');
var mongojs = require('mongojs');

var router = express.Router();

var db = mongojs('mongodb://mafia_admin:bestappever_mafia_admin123@ds145790.mlab.com:45790/mafia_db',['game']);

//REST API

// Get All Games
router.get('/game', function(req, res, next){
    db.game.find(function(err, allGames){
        if(err){
            res.send(err);
        }
        res.json(allGames);
    });
});

// Get Single game
router.get('/game/:id', function(req, res, next){
    console.log(req.params.id);
    console.log(typeof(req.params.id));
    db.game.findOne({"game_id": parseInt(req.params.id)}, function(err, singleGame){
        if(err){
            res.send(err);
        }
        res.json(singleGame);
    });
});

//Save game
router.post('/game', function(req, res, next){
    var game = req.body;
    if(!game.game_id || !(game.player_num)){
        res.status(400);
        res.json({
            "error": "Bad Data"
        });
    } else {
        db.game.save(game, function(err, game){
            if(err){
                res.send(err);
            }
            res.json(game);
        });
    }
});

// Delete game
router.delete('/game/:id', function(req, res, next){
    db.game.remove({game_id: mongojs.ObjectId(req.params.id)}, function(err, game){
        if(err){
            res.send(err);
        }
        res.json(game);
    });
});

// Update game
router.put('/game/:id', function(req, res, next){
    var game = req.body;
    var updateGame = {};
    
    if(game.isDone){
        updateGame.isDone = game.isDone;
    }
    
    if(game.title){
        updateGame.title = game.title;
    }
    
    if(!updateGame){
        res.status(400);
        res.json({
            "error":"Bad Data"
        });
    } else {
        db.game.update({game_id: mongojs.ObjectId(req.params.id)},updateGame, {}, function(err, game){
        if(err){
            res.send(err);
        }
        res.json(game);
    });
    }
});



module.exports = router;