module.exports = function(server,clientSocket){
    //game events
    
    //Add the player to the game room
    clientSocket.on("joinGameRoom", function(data){
    	/* // Error checking
    		//check if the game is currently running 
    	var clientGameInfo;
    	db.game.findOne({"game_id": toString(data.game_id)}, function(err, game){
	        if(err){
	        	console.log("joinGameRoom Error in finding game")
	        }
	        else if(!game){
	            console.log("Could not find game");
	            return;
	        }
	        clientGameInfo = game;
        });
	 	if(!clientGameInfo){
	 		console.log("Error")
	 		return;
	 	}




    	let gameRoom = toString(data.game_id);
*/
        clientSocket.join(toString(data.game_id),function(){
        	//tell the other people in the room that you have joined
            var newPerson = {player_name = data.player_name};
        	server.to(toString(data.game_id)).emit("newUserInGameRoom",newPerson);
        })
    });

    clientSocket.on('disconnect',function(data){
        console.log("Client Disconnected");
    })


};