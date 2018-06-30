var mongojs = require('mongojs');
var db = mongojs('mongodb://mafia_admin:bestappever_mafia_admin123@ds145790.mlab.com:45790/mafia_db',['game','player']);

//shuffle algorithm
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

module.exports = function(server,clientSocket){
    //Add the player to the game room
    clientSocket.on("joinGameRoom", function(data){
        clientSocket.nickname = data.player_name;
        clientSocket.gameRoom = data.game_id;

        // add the player id into the mongojs database
        var bulkUpdate = db.game.initializeUnorderedBulkOp();
        bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$push: { "player_list": clientSocket.player_id} });
        bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$inc: {"player_num": 1} });
        var newJoinAnnoucement = {  "from": "server",
                                "from_id": "server",
                                "to": "all",                        //player_id for whisper or all and mafia from those groups
                                "msg_type": "annoucement",                      //annoucement,
                                "message": clientSocket.nickname + " has joined the room",
                              };
        bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$push: { "chat_log": newJoinAnnoucement}});

        bulkUpdate.execute(function (err, res) {
            console.log("added " + clientSocket.player_id +" to" + clientSocket.gameRoom);
        })

        //To everyone else in the gameRoom add a new person
        var newPerson = {player_name: data.player_name};
        server.to(data.game_id).emit("newUserInGameRoom",newPerson);

        clientSocket.join(data.game_id,function(){
        	//tell the other people in the room that you have joined

            server.in(data.game_id).clients((err , clients) => {
                // clients will be array of socket ids , currently available in given room
                clients.forEach(function(client) {
                    // var initialUpdateValue = server.of("/").connected[client].nickname != clientSocket.nickname;
                    var newPersonLoop = {player_name: server.of("/").connected[client].nickname};
                    server.to(clientSocket.id).emit('newUserInGameRoom',newPersonLoop);
                });
            });
            server.to(data.game_id).emit("messageToClient",newJoinAnnoucement);
        });
    });

    clientSocket.on("leaveGameRoom",function(){
        var player = {player_name: clientSocket.nickname};

        //remove the player from the database game
        var bulkUpdate = db.game.initializeUnorderedBulkOp();
        bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$push: { "player_list": clientSocket.player_id} });
        bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$inc: {"player_num": -1} });
        var newLeaveAnnoucement = {  "from": "server",
                                    "from_id": "server",
                                    "to": "all",                        //player_id for whisper or all and mafia from those groups
                                    "msg_type": "annoucement",                      //annoucement,
                                    "message": clientSocket.nickname + " has left the room",
                                 };
        server.to(clientSocket.gameRoom).emit("messageToClient",newLeaveAnnoucement);
        bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$push: { "chat_log": newLeaveAnnoucement}})

        bulkUpdate.execute(function (err, res) {
            //if(lastErrorObject.n == 1){
                console.log("removed" + clientSocket.nickname + "from game room" + clientSocket.gameRoom);
                server.to(clientSocket.gameRoom).emit("playerLeaving",player);
                clientSocket.leave(clientSocket.gameRoom);
            //}
            //else{
             //   console.log("lastErrorObject: ", lastErrorObject);
           // }
        });
    });

    clientSocket.on('disconnect',function(){
        if("gameRoom" in clientSocket){
            var player = {player_name: clientSocket.nickname};

            //remove the player from the database game
            var bulkUpdate = db.game.initializeUnorderedBulkOp();
            bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$push: { "player_list": clientSocket.player_id} });
            bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$inc: {"player_num": -1} });
            var newLeaveAnnoucement = {  "from": "server",
                                    "from_id": "server",
                                    "to": "all",                        //player_id for whisper or all and mafia from those groups
                                    "msg_type": "annoucement",                      //annoucement,
                                    "message": clientSocket.nickname + " has left the room",
                                  };
            server.to(clientSocket.gameRoom).emit("messageToClient",newLeaveAnnoucement);
            bulkUpdate.find({"game_id": clientSocket.gameRoom}).update({$push: { "chat_log": newLeaveAnnoucement}})

            bulkUpdate.execute(function (err, res) {
                //if(lastErrorObject.n == 1){
                    console.log("removed" + clientSocket.nickname + "from game room" + clientSocket.gameRoom);
                    server.to(clientSocket.gameRoom).emit("playerLeaving",player);
                    clientSocket.leave(clientSocket.gameRoom);
                //}
                //else{
                 //   console.log("lastErrorObject: ", lastErrorObject);
                //}
            });
        }

        console.log("Client Disconnected");
    });

    clientSocket.on("createProfile",function(data,callback){
        //create the player variable
        var playerJSON = {
                "player_name": data.player_name,
                "inGame": false,
                "isAlive": true,
                "role": "",
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
            "player_num": 0,
            "game_admin": data.player_id,
            "game_status": { "game_started": false,
                             "day_counter": null,
                             "day": null,
                             "gameRoles": [ {   "type": "detective",
                                                "amount": data.detectiveNum,
                                            },
                                            {   "type": "mafia",
                                                "amount": data.mafiaNum,
                                            },
                                            {   "type": "guardianAngel",
                                                "amount": data.guardianAngelNum,
                                            },
                                            {   "type": "townsPeople",
                                                "amount": data.townsPeopleNum,
                                            }
                                           ]
                            },
            "player_list": [],
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
        //confirm that the client emitting is the admin of the game room
        db.game.findOne({"game_id": clientSocket.gameRoom},function(err,game){
            var player_num = parseInt(game.player_num);
            var detectiveNum = parseInt(game.game_status.gameRoles[0].amount);
            var mafiaNum = parseInt(game.game_status.gameRoles[1].amount);
            var guardianAngelNum = parseInt(game.game_status.gameRoles[2].amount);
            var townsPeopleNum = game.game_status.gameRoles[3].amount; //usually "fill"

            var minNum = detectiveNum + mafiaNum + guardianAngelNum;

            if(game.game_admin == clientSocket.player_id && player_num >= minNum){

                var player_list = game.player_list;
                shuffle(player_list);

                for(var i = 0; i <= game.player_num; i++){
                    var bulkUpdate = db.player.initializeUnorderedBulkOp();
                    var playerRole = "townsPeople";
                    if(detectiveNum > 0){
                        playerRole = "detective";
                    }
                    else if(mafiaNum > 0){
                        playerRole = "mafia";
                    }
                    else if(guardianAngelNum > 0){
                        playerRole = "guardianAngel";
                    }

                    bulkUpdate.find( {"_id": game.player_list[i] }).update( {$set: { "inGame": true} } );
                    bulkUpdate.find( {"_id": game.player_list[i] }).update( {$set: { "isAlive": true} } );
                    bulkUpdate.find( {"_id": game.player_list[i] }).update( {$set: { "role": playerRole} } );

                    bulkUpdate.execute(function(err,res){
                        // Tell all the clients that the data is ready
                        server.to(clientSocket.gameRoom).emit("gameIsReady");
                    });
                }
            }
            else{
                console.log("player does not have permission to start the game");
            }
        });
    })

};