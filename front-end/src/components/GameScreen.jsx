import React, { Component } from 'react';

class GameScreen extends Component {
	constructor(props) {
	  	super(props);
		this.createGame = this.createGame.bind(this);
		this.navigateBack = this.navigateBack.bind(this);
		this.handleNameInputChange = this.handleNameInputChange.bind(this);
	  	this.state = {	errorName: false,
	  					player_name: ""
	  				};
	}


	componentDidMount(){
		
	}

	render() {
		return (
			<div className="text-center">
				
			</div>
		);
	}
}

export default GameScreen;
