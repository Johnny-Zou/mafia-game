import React, { Component } from 'react';

class Welcome extends Component {
	constructor(props) {
	  	super(props);
		this.joinRoom = this.joinRoom.bind(this);
		this.createRoom = this.createRoom.bind(this);
		this.handleNameInputChange = this.handleNameInputChange.bind(this);
	  	this.state = {	errorName: false,
	  					player_name: this.props.player_name
	  				};
	}

	handleNameInputChange(e){
		 this.setState({player_name: e.target.value});

	}

	joinRoom(){
		if(this.state.player_name === ""){
			this.setState({errorName: true});
		}
		else{
			this.props.onNameChange(this.state.player_name);
			this.props.onPageChange("JoinGame");	
		}
		
	}

	createRoom(){
		if(this.state.player_name === ""){
			this.setState({errorName: true});
		}
		else{
			this.props.onNameChange(this.state.player_name);
			this.props.onPageChange("CreateGame");	
		}
		
	}

	render() {
		const errorMsg = this.state.errorName ? (
				<p>Error, you must enter a player name</p>
			):(
				<p></p>
			);
		return (
			<div className="text-center">
				<h1>Welcome Mafia - the party game</h1>

				<p>Enter your player name: </p>
				<input value={this.state.player_name} onChange={this.handleNameInputChange}type="text" name="playerName"/>
    			<br/>
    			<br/>
    			{errorMsg}
    			<div className="container">
  				<div className="row justify-content-center">
  					<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
			       		<button type="button" className="btn btn-primary" onClick={this.joinRoom}>Join Room</button>
			       	</div>
			       	<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
			       		<button type="button" className="btn btn-primary" onClick={this.createRoom}>Create Room</button>
			       	</div>
			    </div>
			    </div>
		       	<br/>
		        
		       	<p id="errorMsg"></p>
			</div>
		);
	}
}

export default Welcome;
