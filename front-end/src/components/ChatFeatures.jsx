import React, { Component } from 'react';
import $ from 'jquery';

import '../chat.css';

class ChatFeatures extends Component {
	constructor(props) {
	  	super(props);

	  	this.handleCurrentMsgChange = this.handleCurrentMsgChange.bind(this);
		this.sendMsg = this.sendMsg.bind(this);
		this.componentDidMount = this.componentDidMount.bind(this);
		this.handleEnterKeySubmit = this.handleEnterKeySubmit.bind(this);

	  	this.state = {player_list: [],
	  					chat_log: [],
	  					current_msg: "",
	  				};
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
				var player_nameList = json.player_list.map(function(player){
					return player.name;
				});
				self.setState({player_list: player_nameList});

				//scroll down
				var element = document.getElementById("scrollableChat");
		   		element.scrollTop = element.scrollHeight - element.clientHeight;
			})
			.fail(function( jqxhr, textStatus, error ) {
				if(jqxhr.status == 404){
					console.log("Game id" + self.state.game_id + "does not exist");
				}
			});

		// Socket event listeners
		client.on('messageToClient', this._messageToClient.bind(this));
		client.on('playerLeaving', this._playerLeavingGameRoom.bind(this));
	}

	_messageToClient(data){
		var currentMsgList = this.state.chat_log;
		var newMessage = {from: data.from, message: data.message, msg_type: data.msg_type, messageTo: data.to};
		currentMsgList.push(newMessage);
		this.setState({chat_log: currentMsgList});
		
		//scroll down
		var element = document.getElementById("scrollableChat");
   		element.scrollTop = element.scrollHeight - element.clientHeight;
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

	sendMsg(){
		if(this.state.current_msg.length > 0){
			const client = this.props.client;

			var message = {player_name: this.props.player_name, message: this.state.current_msg, game_id: this.props.game_id, msg_type: "chat", messageTo: "all"};
			client.emit("messageToServer",message);

			//clear the current msg
			this.setState({current_msg: ""});
		}
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
			</div>
		);
	}
}

export default ChatFeatures;
