import React, { Component } from 'react';

class JoinGame extends Component {
	constructor(props) {
	  	super(props);

	  	//binding
	  	this.handleGameIDInputChange = this.handleGameIDInputChange.bind(this);
	  	this.joinGame = this.joinGame.bind(this);
	  	this.navigateBack = this.navigateBack.bind(this);

	  	this.state = {	errorGame: false,
	  					game_id: ""
	  				};
	}

	handleGameIDInputChange(e){
		 this.setState({game_id: e.target.value});
	}

	joinGame(){
		//Checks
		// **TODO**

		this.props.onGameIDChange(this.state.game_id);
		this.props.onPageChange("Lobby");
	}

	navigateBack(){
		this.props.onPageChange("Welcome");	
	}

	render() {
		const errorMsg = this.state.errorName ? (
				<p>Error, you must enter a player name</p>
			):(
				<p></p>
			);
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
  					<div className="col-2">
			       		<button type="button" className="btn btn-primary" onClick={this.joinGame}>Join Game</button>
			       	</div>
			       	<div className="col-2">
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
