import React, { Component } from 'react';

class CreateGame extends Component {
	constructor(props) {
	  	super(props);
		this.createGame = this.createGame.bind(this);
		this.navigateBack = this.navigateBack.bind(this);
		this.handleNameInputChange = this.handleNameInputChange.bind(this);
	  	this.state = {	errorName: false,
	  					player_name: ""
	  				};
	}

	handleNameInputChange(e){
		 this.setState({player_name: e.target.value});

	}

	createGame(){
		
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
				<h1>Create Game | Mafia - the party game</h1>

				<p>Hey {this.props.player_name}, set up your new game below!</p>
				<input value={this.state.player_name} onChange={this.handleNameInputChange}type="text" name="playerName"/>
    			<br/>
    			<br/>
    			{errorMsg}
    			<div className="container">
  				<div className="row justify-content-center">
  					<div className="col-2">
			       		<button type="button" className="btn btn-primary" onClick={this.createGame}>Create Game</button>
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

export default CreateGame;