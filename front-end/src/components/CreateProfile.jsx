import React, { Component } from 'react';

class CreateProfile extends Component {
	constructor(props) {
	  	super(props);

		this.createProfile = this.createProfile.bind(this);
		this.handleNameInputChange = this.handleNameInputChange.bind(this);

	  	this.state = {	errorName: false,
	  					player_name: "",
	  				};
	}

	handleNameInputChange(e){
		 this.setState({player_name: e.target.value});
	}

	createProfile(){
		if(this.state.player_name === ""){
			this.setState({errorName: true});
		}
		else{
			//set a socket request to create profile
			const client = this.props.client;
			var data = {player_name: this.state.player_name};

			var self = this;
			client.emit("createProfile",data,function(callbackData){
				if(callbackData.success == true){
					self.props.onNameChange(callbackData.player_name);
					self.props.onPlayerIDChange(callbackData.player_id);
					self.props.onPageChange("Welcome");	
				}
			});
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
				<input value={this.state.player_name} onChange={this.handleNameInputChange} type="text" name="playerName"/>
    			<br/>
    			<br/>
    			{errorMsg}
    			<div className="container">
  				<div className="row justify-content-center">
			       	<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
			       		<button type="button" className="btn btn-primary" onClick={this.createProfile}>Create Profile</button>
			       	</div>
			    </div>
			    </div>
		       	<br/>
		        
		       	<p id="errorMsg"></p>
			</div>
		);
	}
}

export default CreateProfile;
