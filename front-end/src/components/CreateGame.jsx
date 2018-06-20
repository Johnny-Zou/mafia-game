import React, { Component } from 'react';

class CreateGame extends Component {
	constructor(props) {
	  	super(props);
		this.createGame = this.createGame.bind(this);
		this.navigateBack = this.navigateBack.bind(this);
	  	this.state = {	errorName: false,
	  				};
	}

	createGame(){
		const client = this.props.client;

		var data = {player_name: this.props.player_name};
		var self = this;
		client.emit("createGame",data,function(callbackData){
			if(callbackData.success == true){
				self.props.onGameIDChange(callbackData.game_id);
				self.props.onPageChange("Lobby");
			}
		});
	}

	navigateBack(){
		this.props.onPageChange("Welcome");	
	}

	render() {
		return (
			<div className="text-center">
				<h1>Create Game | Mafia - the party game</h1>

				<p>Hey {this.props.player_name}, set up your new game below!</p>
    			<br/>
    			<br/>
    			<div className="container">
  				<div className="row justify-content-center">
  					<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
			       		<button type="button" className="btn btn-primary" onClick={this.createGame}>Create Game</button>
			       	</div>
			       	<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
			       		<button type="button" className="btn btn-primary" onClick={this.navigateBack}>Back</button>
			       	</div>
			    </div>
			    </div>
		       	<br/>
		        
		       	<p id="errorMsg"></p>
			</div>
		);
	}
}

export default CreateGame;
