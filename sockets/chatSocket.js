var mongojs = require('mongojs');
var db = mongojs('mongodb://mafia_admin:bestappever_mafia_admin123@ds145790.mlab.com:45790/mafia_db',['game','player']);

module.exports = function(server,clientSocket){


	clientSocket.on("messageToServer", function(data){

		var newMessageForClient = {player_name: data.player_name, message: data.message};
		var mongoChatObject = {	"from": clientSocket.nickname,
								"from_id": clientSocket.gameRoom,
								"to": "all",						//player_id for whisper or all and mafia from those groups
								"msg_type": "annoucement",						//annoucement,
								"message": data.message,
							  };
		db.game.update(
            {"game_id": clientSocket.gameRoom},
            { $push: { "chat_log": mongoChatObject} },
            function(err,doc,lastErrorObject){
               console.log("pushed " + lastErrorObject.n + " chat messages!");
               server.to(data.game_id).emit("messageToClient",newMessageForClient);
            }
        );

		

	});


	/*
	clientSocket.on("whisperToServer",function(data)){
		var newMessageForClient = {player_name: data.player_name, message:data.message};

		//loop through all the connected sockets
		server.in(data.game_id).clients((err , clients) => {
            // clients will be array of socket ids , currently available in given room
            clients.forEach(function(client) {
                var  = {player_name: server.of("/").connected[client].nickname};
                if(server.of("/").connected[client].nickname == data.selected_player_id){
                	server.to(playerReceive).emit("messageToClient",newMessageForClient);
                	return;
                }
            });
        });
		
	}*/
}