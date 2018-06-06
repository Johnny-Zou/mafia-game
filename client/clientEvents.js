var baseURL = "file:///Users/Johnny/Desktop/Coding/Github/mafia-game/views";

//Events
function joinRoom(){
	var name = $('#player_name').val();
	if(!name){
		$("#errorMsg").text("Error, you must provide a name");
		return;
	}
	sessionStorage.setItem('player_name', name);

	window.location.href = baseURL + "/joinGame.html"; 
};

function createRoom(){
	var name = $('#player_name').val();
	if(!name){
		$("#errorMsg").text("Error, you must provide a name");
		return;
	}
	window.location.href + "/createGame.html"; 
};

function backToLanding(){
	//clear sessional storage
	sessionalStorage.removeItem("player_name");

	window.location.href = baseURL + "/index.html"; 
};

function submitJoin(){
	var game_id = $('#game_id').val();


	sessionalStorage.setItem("game_id", game_id);

	window.location.href = baseURL + "/lobby.html";
}



$(document).ready(function(){
	if(window.location.href == baseURL + "/joinGame.html"){
		var name = sessionStorage.getItem("player_name");
		$("#greeting").text("welcome player " + name);
	}

});

