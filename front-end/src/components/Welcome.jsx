import React, { Component } from 'react';

class Welcome extends Component {
	constructor(props) {
	  	super(props);
		this.joinRoom = this.joinRoom.bind(this);
		this.createRoom = this.createRoom.bind(this);
	  	this.state = {	
	  				};
	}


	joinRoom(){
		this.props.onPageChange("JoinGame");	
		
	}

	createRoom(){
		this.props.onPageChange("CreateGame");	
	}

	render() {
		return (
			<div className="text-center">
				<h1>Welcome Mafia - the party game</h1>

				<h1>Hello <strong> {this.props.player_name}</strong> </h1>
    			<br/>
    			<br/>
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
