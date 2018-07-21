import React, { Component } from 'react';
import $ from 'jquery';

//Components
import ChatFeatures from './ChatFeatures'
import '../chat.css';

class GameScreen extends Component {
	constructor(props) {
	  	super(props);

	  	this.handlePlayerSelectChange = this.handlePlayerSelectChange.bind(this);
	  	this.savePlayerSelect = this.savePlayerSelect.bind(this);

	  	this.endTurn = this.endTurn.bind(this);

	  	this.state = { player: {},
	  				   game: {},
	  				   player_ready: false,
	  				   game_ready: false,
	  				   player_select_name: "none",
	  				   player_select_id: "none",
	  				   new_player_select_id: "none"
	  				};
	}


	componentDidMount(){
		const client = this.props.client;
		//get request to fetch player's role
		var self = this;
		$.getJSON("http://" + this.props.serverURL + "/api/player/" + this.props.player_id)
			.done(function( json ) {
				//get the entire player object
				self.setState({player: json, player_ready: true});
			})
			.fail(function( jqxhr, textStatus, error ) {
				if(jqxhr.status == 404){
					console.log("player" + this.props.player_id + "does not exist");
				}
			}
		);
		$.getJSON("http://" + this.props.serverURL + "/api/game/" + this.props.game_id)
			.done(function( json ) {
				//get the entire player object
				self.setState({game: json, game_ready: true});
			})
			.fail(function( jqxhr, textStatus, error ) {
				if(jqxhr.status == 404){
					console.log("game" + this.props.game_id + "does not exist");
				}
			}
		);

		// Socket event listeners
		client.on('alertClient', this._alertClient.bind(this));
	}

	handlePlayerSelectChange(e){
		this.setState({"new_player_select_id": e.target.value});
	}

	savePlayerSelect(){
		var self = this;
		$.each(this.state.game.player_list, function(i, v) {
		    if (v.player_id == self.state.new_player_select_id) {
		        self.setState({"player_select_id": self.state.new_player_select_id, "player_select_name": v.player_name});
		    }
		});
	}

	endTurn(){
		const client = this.props.client;
		if(this.state.game.game_status.day){
			var dataLynch = {player_id: this.props.player_id, target_player_id: this.state.player_select_id};
			client.emit("submitLynchAction",dataLynch);
		}
		else{
			switch(this.state.player.role){
				case "detective":
					var dataDetective = {player_id: this.props.player_id, target_player_id: this.state.player_select_id };
					client.emit("submitDetectiveAction",dataDetective);
					break;
				case "mafia":
					var dataMafia = {player_id: this.props.player_id, target_player_id: this.state.player_select_id };
					client.emit("submitMafiaAction",dataMafia);
					break;
				case "guardianAngel":
					var dataGuardianAngel = {player_id: this.props.player_id, target_player_id: this.state.player_select_id };
					client.emit("submitGuardianAngelAction",dataGuardianAngel);
					break;
				case "townsPeople":
					console.log("nothing to do");
					break;
				default:
					console.log("no role?");
					break;
			}
		}
	}

	_alertClient(data){
		switch(this.state.player.role){
			case "detective":
				if(data.isMafia){
					window.alert("HE IS THE MAFIA");
				}
				else{
					window.alert("He is not the mafia");
				}
				break;
			case "mafia":
				var playerList = this.state.game.player_list;
				var foundPlayer = playerList.find(element => element.player_id == data.target_player_id);
				window.alert(foundPlayer.player_name + " will be killed");
				break;
			case "guardianAngel":
				var playerList = this.state.game.player_list;
				var foundPlayer = playerList.find(element => element.player_id == data.target_player_id);
				window.alert(data.target_player_name + " will be saved");
				break;
			case "townsPeople":
				break;
			default:
				console.log("no role?")
				break;
		}
	}


	render() {
		if(this.state.player_ready && this.state.game_ready){
			var playerSelectList = this.state.game.player_list.map((playerObj) =>
										<option value={playerObj.player_id}>{playerObj.player_name}</option>
									);

			var playerSelectModal = <div className="modal fade" id="playerSelectModalLynch" tabIndex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
									  <div className="modal-dialog modal-dialog-centered" role="document">
									    <div className="modal-content">
									      <div className="modal-header">
									        <h5 className="modal-title" id="exampleModalLongTitle">Select a player...</h5>
									        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
									          <span aria-hidden="true">&times;</span>
									        </button>
									      </div>
									      <div className="modal-body">
									      	<select onChange={this.handlePlayerSelectChange} className="custom-select" id="guardianAngelAmount">
												{playerSelectList}
												<option value="none" selected>none</option>
											</select>
									      </div>
									      <div className="modal-footer">
									        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
									        <button type="button" className="btn btn-primary" data-dismiss="modal" onClick={this.savePlayerSelect} >Save changes</button>
									      </div>
									    </div>
									  </div>
									</div>;

			var actions = 	<div className="row justify-content-center text-center">
								<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
				       				<button type="button" className="btn btn-lg btn-danger" data-toggle="modal" data-target="#playerSelectModalLynch">Lynch</button>
				       			</div>
								{playerSelectModal}
							</div>;

			switch(this.state.player.role){
				case "detective":
					if(!this.state.game.game_status.day){
						actions = 	<div className="row justify-content-center text-center">
										<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
						       				<button type="button" className="btn btn-lg btn-danger" data-toggle="modal" data-target="#playerSelectModalLynch">Investigate</button>
						       			</div>
										{playerSelectModal}
									</div>;
					}
					return(
						<div>
							<div className="text-center">
								<h1>Game Screen | Mafia - the party game</h1>
								<p>Hey {this.props.player_name}, welcome to the game screen</p>
							</div>
			    			
			    			<br/>

							<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Info</div>
								</div>
								<br/>
								<ul className="list-group col-6 mx-auto">
									<li className="list-group-item">Game ID: {this.props.game_id}</li>
									<li className="list-group-item">Game Role: {this.state.player.role} </li>
									<li className="list-group-item">Game Day: {this.state.game.game_status.day_counter}</li>
									<li className="list-group-item">Currently: {this.state.game.game_status.day ? "day" : "night"}</li>
									<li className="list-group-item">Currently Selected: {this.state.player_select_name}</li>
								</ul>
							</div>

							<br/>
							<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Actions</div>
								</div>
							</div>
							<br/>
							<div className ="container">
								{actions}
								<br/>
								<br/>
								<div className="row justify-content-center text-center">
									<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
					       				<button type="button" className="btn btn-primary" onClick={this.endTurn}>End {this.state.game.game_status.day ? "day" : "night"}</button>
					       			</div>
					       			<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
					       				<button type="button" className="btn btn-primary" disabled>Quit Game</button>
					       			</div>
								</div>
							</div>

							<br/>
			    			<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Chat</div>
								</div>
							</div>
							<br/>
							<ChatFeatures serverURL = {this.props.serverURL} client = {this.props.client} player_name = {this.props.player_name} game_id = {this.props.game_id}/>

							<br/>
							<br/>
						</div>
					);
				case "mafia":
					if(!this.state.game.game_status.day){
						actions = 	<div className="row justify-content-center text-center">
										<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
						       				<button type="button" className="btn btn-lg btn-danger" data-toggle="modal" data-target="#playerSelectModalLynch">Kill</button>
						       			</div>
										{playerSelectModal}
									</div>;
					}
					return(
						<div>
							<div className="text-center">
								<h1>Game Screen | Mafia - the party game</h1>
								<p>Hey {this.props.player_name}, welcome to the game screen</p>
							</div>
			    			
			    			<br/>

							<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Info</div>
								</div>
								<br/>
								<ul className="list-group col-6 mx-auto">
									<li className="list-group-item">Game ID: {this.props.game_id}</li>
									<li className="list-group-item">Game Role: {this.state.player.role} </li>
									<li className="list-group-item">Game Day: {this.state.game.game_status.day_counter}</li>
									<li className="list-group-item">Currently: {this.state.game.game_status.day ? "day" : "night"}</li>
									<li className="list-group-item">Currently Selected: {this.state.player_select_name}</li>
								</ul>
							</div>

							<br/>
							<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Actions</div>
								</div>
							</div>
							<br/>
							<div className ="container">
								{actions}
								<br/>
								<br/>
								<div className="row justify-content-center text-center">
									<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
					       				<button type="button" className="btn btn-primary" onClick={this.endTurn}>End {this.state.game.game_status.day ? "day" : "night"}</button>
					       			</div>
					       			<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
					       				<button type="button" className="btn btn-primary" disabled>Quit Game</button>
					       			</div>
								</div>
							</div>

							<br/>
			    			<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Chat</div>
								</div>
							</div>
							<br/>
							<ChatFeatures serverURL = {this.props.serverURL} client = {this.props.client} player_name = {this.props.player_name} game_id = {this.props.game_id}/>

							<br/>
							<br/>
						</div>
					);
				case "guardianAngel":
					if(!this.state.game.game_status.day){
						actions = 	<div className="row justify-content-center text-center">
										<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
						       				<button type="button" className="btn btn-lg btn-danger" data-toggle="modal" data-target="#playerSelectModalLynch">Save</button>
						       			</div>
										{playerSelectModal}
									</div>;
					}
					return(
						<div>
							<div className="text-center">
								<h1>Game Screen | Mafia - the party game</h1>
								<p>Hey {this.props.player_name}, welcome to the game screen</p>
							</div>
			    			
			    			<br/>

							<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Info</div>
								</div>
								<br/>
								<ul className="list-group col-6 mx-auto">
									<li className="list-group-item">Game ID: {this.props.game_id}</li>
									<li className="list-group-item">Game Role: {this.state.player.role} </li>
									<li className="list-group-item">Game Day: {this.state.game.game_status.day_counter}</li>
									<li className="list-group-item">Currently: {this.state.game.game_status.day ? "day" : "night"}</li>
									<li className="list-group-item">Currently Selected: {this.state.player_select_name}</li>
								</ul>
							</div>

							<br/>
							<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Actions</div>
								</div>
							</div>
							<br/>
							<div className ="container">
								{actions}
								<br/>
								<br/>
								<div className="row justify-content-center text-center">
									<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
					       				<button type="button" className="btn btn-primary" onClick={this.endTurn}>End {this.state.game.game_status.day ? "day" : "night"}</button>
					       			</div>
					       			<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
					       				<button type="button" className="btn btn-primary" disabled>Quit Game</button>
					       			</div>
								</div>
							</div>

							<br/>
			    			<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Chat</div>
								</div>
							</div>
							<br/>
							<ChatFeatures serverURL = {this.props.serverURL} client = {this.props.client} player_name = {this.props.player_name} game_id = {this.props.game_id}/>

							<br/>
							<br/>
						</div>
					);
				case "townsPeople":
					if(!this.state.game.game_status.day){
						actions = 	<div className="row justify-content-center text-center">
										<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
						       				<button type="button" className="btn btn-lg btn-danger" disable>Chill</button>
						       			</div>
									</div>;
					}
					return(
						<div>
							<div className="text-center">
								<h1>Game Screen | Mafia - the party game</h1>
								<p>Hey {this.props.player_name}, welcome to the game screen</p>
							</div>
			    			
			    			<br/>

							<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Info</div>
								</div>
								<br/>
								<ul className="list-group col-6 mx-auto">
									<li className="list-group-item">Game ID: {this.props.game_id}</li>
									<li className="list-group-item">Game Role: {this.state.player.role}</li>
									<li className="list-group-item">Game Day: {this.state.game.game_status.day_counter}</li>
									<li className="list-group-item">Currently: {this.state.game.game_status.day ? "day" : "night"}</li>
									<li className="list-group-item">Currently Selected: {this.state.player_select_name}</li>
								</ul>
							</div>

							<br/>
							<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Actions</div>
								</div>
							</div>
							<br/>
							<div className ="container">
								{actions}
								<br/>
								<br/>
								<div className="row justify-content-center text-center">
									<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
					       				<button type="button" className="btn btn-primary" onClick={this.endTurn}>End {this.state.game.game_status.day ? "day" : "night"}</button>
					       			</div>
					       			<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
					       				<button type="button" className="btn btn-primary" disabled>Quit Game</button>
					       			</div>
								</div>
							</div>

							<br/>
			    			<div className ="container">
								<div className="card bg-primary text-white">
									<div className="card-body">Game Chat</div>
								</div>
							</div>
							<br/>
							<ChatFeatures serverURL = {this.props.serverURL} client = {this.props.client} player_name = {this.props.player_name} game_id = {this.props.game_id}/>

							<br/>
							<br/>
						</div>
					);
				default:
					return (
						<div> An Error has occured, no role selected</div>
					);
			}
		}
		else{
			return (<div> loading... </div>);
		}
	}
}

export default GameScreen;
