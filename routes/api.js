var express = require('express');
var mongojs = require('mongojs');

var router = express.Router();

var db = mongojs('mongodb://mafia_admin:bestappever_mafia_admin123@ds145790.mlab.com:45790/mafia_db',['game']);

//REST API

// Get All Games
router.get('/game', function(req, res, next){
    db.game.find(function(err, gameList){
        if(err){
            res.send(err);
        }
        res.json(gameList);
    });
});

// Get Single game
router.get('/game/:id', function(req, res, next){
    console.log(req.params.id);
    console.log(typeof(req.params.id));
    db.game.findOne({"game_id": parseInt(req.params.id)}, function(err, game){
        if(err){
            res.send(err);
        }
        res.json(game);
    });
});

// Create a new game
router.post('/game', function(req, res, next){
    var newGame = req.body;

    //Check that all the fields are completed
    var game_id_complete = !newGame.game_id;
    var player_num_complete = !newGame.player_num;

    var uncompletedFields = game_id_complete || player_num_complete;

    if(uncompletedFields){
        res.status(400);
        res.json({
            "error": "Bad Data"
        });
    } else {
        db.game.save(newGame, function(err, game){
            if(err){
                res.send(err);
            }
            res.json(game);
        });
    }
});

// Delete game
router.delete('/game/:id', function(req, res, next){
    db.game.remove({"game_id": parseInt(req.params.id)}, function(err, game){
        if(err){
            res.send(err);
        }
        res.json(game);
    });
});

// Update game
router.put('/game/:id', function(req, res, next){
    var gameInput = req.body;
    var updateGame = {};
    
    //Do not update the game ID

    //Update the numebr of players
    if(game.player_num){
        updateGame.player_num = gameInput.player_num;
    }

    // Check empty
    if(!updateGame){
        res.status(400);
        res.json({
            "error":"Bad Data"
        });
    } else {
        db.game.update({"game_id": parseInt(req.params.id)}, updateGame, {}, function(err, game){
        if(err){
            res.send(err);
        }
        res.json(game);
    });
    }
});



module.exports = router;