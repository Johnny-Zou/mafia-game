import React, { Component } from 'react';
import $ from 'jquery';

import '../chat.css';

class Lobby extends Component {
	constructor(props) {
	  	super(props);

	  	this.handleCurrentMsgChange = this.handleCurrentMsgChange.bind(this);
		this.navigateBack = this.navigateBack.bind(this);
		this.sendMsg = this.sendMsg.bind(this);
		this.startGameButton = this.startGameButton.bind(this);
		this.componentDidMount = this.componentDidMount.bind(this);
		this.handleEnterKeySubmit = this.handleEnterKeySubmit.bind(this);

	  	this.state = {player_list: [],
	  					chat_log: [],
	  					current_msg: "",
	  				};
	}

	navigateBack(){
		const client = this.props.client;
		// tell the server that the socket is leaving the game room
		var data = {game_id: this.props.game_id, player_name: this.props.player_name};
		client.emit("leaveGameRoom", data);
		this.props.onPageChange("Welcome");	
	}

	handleCurrentMsgChange(e){
		this.setState({current_msg: e.target.value});
	}

	//LifeCycle functions
	componentDidMount(){
		const client = this.props.client;

		//get request to fetch the current chat log
		var self = this;
		$.getJSON("http://" + this.props.serverURL + "/api/game/" + this.props.game_id)
			.done(function( json ) {
				console.log("current chat log:", json.chat_log);
				self.setState({chat_log: json.chat_log});

				//scroll down
				var element = document.getElementById("scrollableChat");
		   		element.scrollTop = element.scrollHeight - element.clientHeight;
			})
			.fail(function( jqxhr, textStatus, error ) {
				if(jqxhr.status == 400){
					console.log("Game id" + self.state.game_id + "does not exist");
				}
			});

		//Join the game room
		var data = {game_id: this.props.game_id, player_name: this.props.player_name};
		client.emit('joinGameRoom', data);

		// Socket event listeners
		client.on('messageToClient', this._messageToClient.bind(this));
		client.on('newUserInGameRoom', this._newUserInGameRoom.bind(this));
		client.on('playerLeaving', this._playerLeavingGameRoom.bind(this));
	}

	_messageToClient(data){
		var currentMsgList = this.state.chat_log;
		var newMessage = {from: data.from, message: data.message, msg_type: "chat", messageTo: "all"};
		currentMsgList.push(newMessage);
		this.setState({chat_log: currentMsgList});
		
		//scroll down
		var element = document.getElementById("scrollableChat");
   		element.scrollTop = element.scrollHeight - element.clientHeight;

	}

	_newUserInGameRoom(data){
		// chat message to tell people a new user is in the room
		// if(!data.initialUpdate){
		// 	var currentMsgList = this.state.chat_log;
		// 	var joinMessage = data.player_name + " has joined the room";
		// 	var newMessage = {player_name: data.player_name, message: joinMessage, msg_type: "annoucement", messageTo: "all"};
		// 	currentMsgList.push(newMessage);
		// 	this.setState({chat_log: currentMsgList});
		// }
		//Update player list
		var currentPlayerList = this.state.player_list;
		currentPlayerList.push(data.player_name);
		this.setState({player_list: currentPlayerList});

		//scroll down
		// var element = document.getElementById("scrollableChat");
   		// element.scrollTop = element.scrollHeight - element.clientHeight;
	}

	_playerLeavingGameRoom(data){
		// //Chat message to tell people a user has left the room
		// var currentMsgList = this.state.chat_log;
		// var leaveMessage = data.player_name + " has left the room";
		// var newMessage = {player_name: data.player_name, message: leaveMessage, msg_type: "annoucement", messageTo: "all"};
		// currentMsgList.push(newMessage);
		// this.setState({chat_log: currentMsgList});

		//Update player list
		var currentPlayerList = this.state.player_list;
		var indexOfRemovingPlayer = currentPlayerList.indexOf(data.player_name);
		if(indexOfRemovingPlayer > -1){
			currentPlayerList.splice(indexOfRemovingPlayer,1);
		}
		this.setState({player_list: currentPlayerList});

		//scroll down
		// var element = document.getElementById("scrollableChat");
  //  		element.scrollTop = element.scrollHeight - element.clientHeight;
	}

	_gameIsReady(){
		this.props.onPageChange("GameScreen");
	}

	sendMsg(){
		if(this.state.current_msg.length > 0){
			const client = this.props.client;

			var message = {player_name: this.props.player_name, message: this.state.current_msg, game_id: this.props.game_id, msg_type: "chat", messageTo: "all"};
			client.emit("messageToServer",message);

			//clear the current msg
			this.setState({current_msg: ""});
		}
	}

	startGameButton(){
		const client = this.props.client;
		var data = {game_id: this.props.game_id}
		client.emit("startGameAdmin", data);
	}

	handleEnterKeySubmit(e){
		if(e.keyCode == 13){
			this.sendMsg();
			e.preventDefault();
		}
	}


	render() {
		const playerList = this.state.player_list.map((playerName) =>
								<tr key={playerName}>
									<td>{playerName}</td>
								</tr>
							);
		const messageList = this.state.chat_log.map((chatMessage,index) =>

								<div className="newMessage" key={chatMessage.from_id + index}>
									{chatMessage.msg_type == "chat" &&
										<div><a className="font-weight-bold">{chatMessage.from}:</a> {chatMessage.message}</div>
									}
									{chatMessage.msg_type == "annoucement" &&
										<div><a className="font-weight-light text-muted font-italic">{chatMessage.message}</a></div>
									}
								</div>
							);


		return (
			<div>
				<div className="text-center">
					<h1>Game Lobby | Mafia - the party game</h1>

					<p>Hey {this.props.player_name}, Welcome to your game lobby </p>

					<div className ="container">
						<div className="card bg-primary text-white">
							<div className="card-body">Game ID: {this.props.game_id}</div>
						</div>
					</div>

				</div>
    			<br/>
    			<br/>

    			<div className="container">
    				<div className="row">
    					<div className="col-md-6">
			    			<table className="table table-dark table-hover table-bordered table-striped">
				    			<thead>
							      <tr>
							        <th>Player Name</th>
							      </tr>
							    </thead>

							    <tbody>
							      {playerList}
							    </tbody>
			    			</table>
		    			</div>
		    			<div className="col-md-6">
		    				<div className="chatContainer rounded bg-light">
		    					<div className="chatInnerMsgContainer">
		    						<div id="scrollableChat" className="chatInnerInnerMsgContainer">
		    							{messageList}
		    						</div>
		    					</div>
		    					<div className="chatBottom">
		    						<textarea className="chatTextBox" value={this.state.current_msg} onKeyDown={this.handleEnterKeySubmit} onChange={this.handleCurrentMsgChange} name="msg"></textarea>
		    						<button type="button" className="chatSubmitTextButton btn btn-info" onClick={this.sendMsg}>Send</button>
		    					</div>
		    				</div>
		    			</div>
	    			</div>
	    		</div>
	    		<br/>
	    		<br/>
    			
    			<div className="container">
	  				<div className="row justify-content-center text-center">
	  					<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
				       		<button type="button" className="btn btn-primary" onClick={this.startGameButton}>Start Game</button>
				       	</div>
				       	<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
				       		<button type="button" className="btn btn-primary" onClick={this.navigateBack}>Quit</button>
				       	</div>
				    </div>
				    </div>
		       		<br/>
		        
		       		<p id="errorMsg"></p>
			</div>
		);
	}
}

export default Lobby;
