module.exports = function(server,clientSocket){


	clientSocket.on("messageToServer", function(data){

		var newMessageForClient = {player_name: data.player_name, message: data.message};

		server.to(toString(data.game_id)).emit("messageToClient",newMessageForClient);

	}
}