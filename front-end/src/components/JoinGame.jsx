import React, { Component } from 'react';
import $ from 'jquery';

class JoinGame extends Component {
	constructor(props) {
	  	super(props);

	  	//binding
	  	this.handleGameIDInputChange = this.handleGameIDInputChange.bind(this);
	  	this.joinGame = this.joinGame.bind(this);
	  	this.navigateBack = this.navigateBack.bind(this);
	  	this.conditionalError = this.conditionalError.bind(this);

	  	this.state = {	error: false,
	  					errorType: 0,
	  					game_id: ""
	  				};
	}

	handleGameIDInputChange(e){
		 this.setState({game_id: e.target.value});
	}

	joinGame(){
		//Check if valid game_id entered
		if(this.state.game_id === ""){
			this.setState({error: true});
			this.setState({errorType: 1});
			return;
		}

		// GET REQUEST to see if game_id exists
		var self = this;
		$.getJSON("http://" + this.props.serverURL + "/api/game/" + this.state.game_id)
			.done(function( json ) {
				self.setState({error: false});
				self.setState({errorType: 0});

				self.props.onGameIDChange(self.state.game_id);
		    	self.props.onPageChange("Lobby");
			})
			.fail(function( jqxhr, textStatus, error ) {
				if(jqxhr.status == 400){
					console.log("Game id" + self.state.game_id + "does not exist");
					self.setState({error: true});
					self.setState({errorType: 2});
				}
			});
	}

	navigateBack(){
		this.props.onPageChange("Welcome");	
	}

	conditionalError(){
		if(this.state.error){
			switch(this.state.errorType){
				case 0:
					return <p></p>;
					break;
				case 1:
					return <p>Error, you must enter a game id</p>;
					break;
				case 2:
					return <p>Sorry, that game id doesn't seem to exist</p>;
					break;
				default:
					return <p>Unknown Error</p>;
			}
		}
	}

	render() {
		const errorMsg = this.conditionalError();

		return (
			<div className="text-center">
				<h1>Join Game | Mafia - the party game</h1>

				<p>Hey {this.props.player_name}, Please enter the game_id you wish to join: </p>
				<input value={this.state.game_id} onChange={this.handleGameIDInputChange}type="text" name="gameID"/>
    			<br/>
    			<br/>
    			{errorMsg}
    			<div className="container">
  				<div className="row justify-content-center">
  					<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
			       		<button type="button" className="btn btn-primary" onClick={this.joinGame}>Join Game</button>
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

export default JoinGame;
