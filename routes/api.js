var express = require('express');
var mongojs = require('mongojs');

var router = express.Router();

var db = mongojs('mongodb://mafia_admin:bestappever_mafia_admin123@ds145790.mlab.com:45790/mafia_db',['game']);

//REST API

// Get All Games
router.get('/game', function(req, res, next){
    db.game.find(function(err, gameList){
        if(err){
            console.log("GET request to /game: ERROR-",err);
            res.send(err);
        }
        console.log("GET request to /game: SUCCESS,",gameList);
        res.json(gameList);
    });
});

// Get Single game
router.get('/game/:id', function(req, res, next){
    db.game.findOne({"game_id": req.params.id}, function(err, game){
        if(err){
            console.log("GET request to /game/id: ERROR-",err);
            res.send(err);
        }
        else if(!game){
            console.log("Could not find game");
            res.status(400);
            res.json({
                "error": "No game found"
            });
            return;
        }
        console.log("GET request to /game/id: SUCCESS,",game);
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
        console.log("Post request to /game: ERROR uncomplete fields with body",newGame);
        console.log("game_id missing:", game_id_complete);
        console.log("player_num missing:", player_num_complete);
        res.status(400);
        res.json({
            "error": "Bad Data"
        });
    } else {
        console.log("Post request to /game:",newGame);
        db.game.save(newGame, function(err, game){
            if(err){
                console.log("Post request to /game: ERROR,",err);
                res.send(err);
            }
            console.log("Post request to /game: SUCCESS,",game);
            res.json(game);
        });
    }
});

// Delete game
router.delete('/game/:id', function(req, res, next){
    db.game.remove({"game_id": req.params.id}, function(err, game){
        if(err){
            console.log("Delete request to /game/:id: ERROR,",err);
            res.send(err);
        }
        if(!game){
            console.log("Could not find game");
            res.status(400);
            res.json({
                "error": "No game found"
            });
            return;
        }
        console.log("Delete request to /game/:id: SUCCESS",game)
        res.json(game);
    });
});

// Update game
router.put('/game/:id', function(req, res, next){
    var gameInput = req.body;
    var updateGame = {};
    
    //Do not update the game ID

    //Update the numebr of players
    if(gameInput.player_num){
        updateGame.player_num = gameInput.player_num;
    }

    // Check empty
    if(!updateGame){
        console.log("Put request to /game/:id: ERROR uncomplete fields with body,",updateGame);
        res.status(400);
        res.json({
            "error":"Bad Data"
        });
    } else {
        db.game.update({"game_id": req.params.id}, updateGame, {}, function(err, game){
            if(err){
                console.log("Put request to /game/:id: DB ERROR with body,",updateGame);
                res.send(err);
            }
            if(!game){
                console.log("Could not find game");
                res.status(400);
                res.json({
                    "error": "No game found"
                });
                return;
            }
            console.log("Put request to /game/:id: SUCCESS",updateGame);
            res.json(game);
        });
    }
});



module.exports = router;