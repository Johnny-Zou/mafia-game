var mongojs = require('mongojs');
var db = mongojs('mongodb://mafia_admin:bestappever_mafia_admin123@ds145790.mlab.com:45790/mafia_db',['game']);

module.exports = function(server,clientSocket){
    //Add the player to the game room
    clientSocket.on("joinGameRoom", function(data){
        clientSocket.nickname = data.player_name;
        clientSocket.gameRoom = data.game_id;

        //To everyone else in the gameRoom add a new person
        var newPerson = {player_name: data.player_name, initialUpdate: false};
        server.to(data.game_id).emit("newUserInGameRoom",newPerson);

        clientSocket.join(data.game_id,function(){
        	//tell the other people in the room that you have joined

            server.in(data.game_id).clients((err , clients) => {
                // clients will be array of socket ids , currently available in given room
                clients.forEach(function(client) {
                    var initialUpdateValue = server.of("/").connected[client].nickname != clientSocket.nickname;
                    var newPersonLoop = {player_name: server.of("/").connected[client].nickname, initialUpdate: initialUpdateValue};
                    server.to(clientSocket.id).emit('newUserInGameRoom',newPersonLoop);
                });
            });
        });
    });

    clientSocket.on("leaveGameRoom",function(data){
        var player = {player_name: data.player_name};
        server.to(data.game_id).emit("playerLeaving",player);

        clientSocket.leave(data.game_id);
    });

    clientSocket.on('disconnect',function(data){
        if("gameRoom" in clientSocket){
            var player = {player_name: clientSocket.nickname};
            server.to(clientSocket.gameRoom).emit("playerLeaving",player);

            clientSocket.leave(clientSocket.gameRoom);
        }

        console.log("Client Disconnected");
    });

    clientSocket.on("createProfile",function(data,callback){
        //create the player variable
        var playerJSON = {
                "player_name": data.player_name,
            }

        //insert into the database
        db.player.insert(playerJSON,function(err,doc){
            //then call the callback function
            var player_id = doc._id.toString();

            //callback function
            var callbackData = {success: true, player_name: data.player_name, player_id: player_id};
            callback(callbackData);
        });


        
    })

    //Game Sockets
    clientSocket.on("createGame",function(data,callback){
        //create game variables
        var temp_game_id;
        var gameJSON = {
            "game_id": temp_game_id,                         
            "player_num": 1,
            "game_admin": data.player_id,
            "game_status": { "game_started": false,
                             "day_counter": null,
                             "day": null
                            },

            "player_list": [data.player_id],
            "chat_log": [],
        }

        //insert game into game collection
        db.game.insert(gameJSON);

        //Callback function
        var callbackData = {success: true};
        callback(callbackData);
    });

    clientSocket.on("startGameAdmin",function(data){
        //Write to database all the players as well as game state
        // db.game.findOne({"game_id": data.game_id}, function(err, game){

        // }



        server.to(data.game_id).emit("gameIsReady");
    })

};