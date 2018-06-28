var mongojs = require('mongojs');
var db = mongojs('mongodb://mafia_admin:bestappever_mafia_admin123@ds145790.mlab.com:45790/mafia_db',['game','player']);

module.exports = function(server,clientSocket){
    //Add the player to the game room
    clientSocket.on("joinGameRoom", function(data){
        clientSocket.nickname = data.player_name;
        clientSocket.gameRoom = data.game_id;

        // add the player id into the mongojs database
        var bulkUpdate = db.game.initializeOrderedBulkOp();
        bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$push: { "player_list": clientSocket.player_id} });
        bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$inc: {"player_num": 1} });

        bulkUpdate.execute(function (err, res) {
            console.log("added " + clientSocket.player_id +" to" + clientSocket.gameRoom);
        })

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

        //remove the player from the database game
        var bulkUpdate = db.game.initializeOrderedBulkOp();
        bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$push: { "player_list": clientSocket.player_id} });
        bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$inc: {"player_num": -1} });

        bulkUpdate.execute(function (err, res) {
            if(lastErrorObject.n == 1){
                console.log("removed" + clientSocket.player_id + "from game room" + data.game_id);
                server.to(data.game_id).emit("playerLeaving",player);
                clientSocket.leave(data.game_id);
            }
            else{
                console.log("lastErrorObject: ", lastErrorObject);
            }
        });
    });

    clientSocket.on('disconnect',function(data){
        if("gameRoom" in clientSocket){
            var player = {player_name: clientSocket.nickname};

            //remove the player from the database game
            var bulkUpdate = db.game.initializeOrderedBulkOp();
            bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$push: { "player_list": clientSocket.player_id} });
            bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$inc: {"player_num": -1} });

            bulkUpdate.execute(function (err, res) {
                if(lastErrorObject.n == 1){
                    console.log("removed" + clientSocket.player_id + "from game room" + data.game_id);
                    server.to(data.game_id).emit("playerLeaving",player);
                    clientSocket.leave(data.game_id);
                }
                else{
                    console.log("lastErrorObject: ", lastErrorObject);
                }
            });

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
            var player_name = doc.player_name.toString();

            clientSocket.player_id = player_id;

            //callback function
            var callbackData = {success: true, player_name: player_name, player_id: player_id};
            callback(callbackData);
        });
    });

    //Game Sockets
    clientSocket.on("createGame",function(data,callback){
        //create game variables
        function makeid() {
            var text = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            for (var i = 0; i < 7; i++){
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }

            return text;
        }

        // Create a Unique 7 character game id
            //TODO MAKE THIS PROMISE AND UNIQUE
        temp_game_id = makeid();

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
        var callbackData = {success: true, game_id: temp_game_id};
        callback(callbackData);
    });

    // Note: cannot use callback here as it is going to multiple clients
    clientSocket.on("startGameAdmin",function(data){
        //Write to database all the players as well as game state
        // db.game.findOne({"game_id": data.game_id}, function(err, game){

        // }



        server.to(data.game_id).emit("gameIsReady");
    })

};