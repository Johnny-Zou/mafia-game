module.exports = function(server,clientSocket){
    //game events
    
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


};