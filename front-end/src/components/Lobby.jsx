import React, { Component } from 'react';

import '../chat.css';

class Lobby extends Component {
	constructor(props) {
	  	super(props);

	  	this.handleCurrentMsgChange = this.handleCurrentMsgChange.bind(this);
		this.navigateBack = this.navigateBack.bind(this);
		this.sendMsg = this.sendMsg.bind(this);
		this.componentDidMount = this.componentDidMount.bind(this);

		this.handleEnterKeySubmit = this.handleEnterKeySubmit.bind(this);

	  	this.state = {player_list: [],
	  					chat_log: [],
	  					current_msg: "",
	  				};
	}

	navigateBack(){
		this.props.onPageChange("Welcome");	
	}

	handleCurrentMsgChange(e){
		this.setState({current_msg: e.target.value});
	}


	//LifeCycle functions
	componentDidMount(){
		
		const client = this.props.client;

		//Join the game room
		client.emit('joinGameRoom', {game_id: this.props.game_id, player_name: this.props.player_name});

		// Socket event listeners
		client.on('messageToClient', this._messageToClient.bind(this));
		client.on('newUserInGameRoom', this._newUserInGameRoom.bind(this));
	}

	_messageToClient(data){
		var currentMsgList = this.state.chat_log;
		var newMessage = {player_name: data.player_name, message: data.message};
		currentMsgList.push(newMessage);
		this.setState({chat_log: currentMsgList});

		//scroll down
		var element = document.getElementById("scrollableChat");
   		element.scrollTop = element.scrollHeight - element.clientHeight;

	}

	_newUserInGameRoom(data){
		var currentPlayerList = this.state.player_list;
		currentPlayerList.push(data.player_name);
		this.setState({player_list: currentPlayerList});
	}



	sendMsg(){
		if(this.state.current_msg.length > 0){
			const client = this.props.client;

			var message = {player_name: this.props.player_name, message: this.state.current_msg, game_id: this.props.game_id};
			client.emit("messageToServer",message);

			//clear the current msg
			this.setState({current_msg: ""});
		}
	}

	handleEnterKeySubmit(e){
		console.log(e.keyCode);
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

								<div className="newMessage" key={chatMessage.player_name + index}>
									<a class="font-weight-bold">{chatMessage.player_name}:</a> {chatMessage.message}
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
				       		<button type="button" className="btn btn-primary" onClick={this.createGame}>Start Game</button>
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
