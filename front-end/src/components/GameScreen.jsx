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
	  	this.reloadGameData = this.reloadGameData.bind(this);
	  	this.reloadPlayerData = this.reloadPlayerData.bind(this);

	  	this.state = { player: {},
	  				   game: {},
	  				   player_ready: false,
	  				   game_ready: false,
	  				   player_select_name: "none",
	  				   player_select_id: "none",
	  				   new_player_select_id: "none",
	  				   "countDownDate": null,
	  				   "timeLeft": {},
	  				};

	  	// Timer stuff
	  	this.timer = 0;
	    this.startTimer = this.startTimer.bind(this);
	    this.countDown = this.countDown.bind(this);
	    this.getTimeRemaining = this.getTimeRemaining.bind(this);
	}


	componentDidMount(){
		const client = this.props.client;
		//get request to fetch player's role
		reloadGameData();
		reloadPlayerData();
		reloadTimeLeft();
		startTimer();
		// Socket event listeners
		client.on('alertClient', this._alertClient.bind(this));
	}

	reloadGameData(){
		var self = this;
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
	}

	reloadPlayerData(){
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
	}

	reloadTimeLeft(){
		var next_change_time_new = this.state.game.game_status.next_change_time;
		this.setState({
			countDownDate: next_change_time_new
		});
	}

	// Timer Stuff
	getTimeRemaining(){
		var now = new Date().getTime();

	    // Find the distance between now an the count down date
	    var distance = this.state.countDownDate - now;

	    // Time calculations for days, hours, minutes and seconds
	    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
	    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

	    var obj = 	{ "d": days,
	    			  "h": hours,
	    			  "m": minutes,
	    			  "s": seconds
	    			};

	    return obj;
	}

	startTimer(){
		if (this.timer == 0) {
	      this.timer = setInterval(this.countDown, 1000);
	    }
	}
	countDown(){
		// Remove one second, set state so a re-render happens.
	    this.setState({
	      timeLeft: getTimeRemaining(),
	    });
	    
	    // Check if we're at zero.
	    var now = new Date().getTime();
	    var difference = this.state.countDownDate - now;
	    if (difference <= 0) { 
	      clearInterval(this.timer);
	    }
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
		if(this.state.game.game_status.isDay){
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
				window.alert(foundPlayer.player_name + " will be saved");
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

			var infoList = <ul className="list-group">
									<li className="list-group-item">Game ID: {this.props.game_id}</li>
									<li className="list-group-item">Game Role: {this.state.player.role} </li>
									<li className="list-group-item">Game Day: {this.state.game.game_status.isDay_counter}</li>
									<li className="list-group-item">Currently: {this.state.game.game_status.isDay ? "day" : "night"}</li>
									<li className="list-group-item">Time Left: {this.state.timeLeft.m} min {this.state.timeLeft.s} seconds</li>
									<li className="list-group-item">Currently Selected: {this.state.player_select_name}</li>
								</ul>;

			var playerList = this.state.game.player_list.map((playerObj) =>
									<li className="{playerObj.isAlive ? 'list-group-item' : 'list-group-item-danger'}">player Name: {playerObj.player_name}</li>
								);

			switch(this.state.player.role){
				case "detective":
					if(!this.state.game.game_status.isDay){
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
								<div className="row justify-content-center text-center">
									<div className="col-6 mx-auto">
										<h3>GameDetails</h3>
										{infoList}
									</div>
									<div className="col-6 mx-auto">
										<h3>Player List</h3>
										<ul className="list-group">
											{playerList}
										</ul>
									</div>
								</div>
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
					       				<button type="button" className="btn btn-primary" onClick={this.endTurn}>End {this.state.game.game_status.isDay ? "day" : "night"}</button>
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
					if(!this.state.game.game_status.isDay){
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
								{infoList}
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
					       				<button type="button" className="btn btn-primary" onClick={this.endTurn}>End {this.state.game.game_status.isDay ? "day" : "night"}</button>
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
					if(!this.state.game.game_status.isDay){
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
								{infoList}
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
					       				<button type="button" className="btn btn-primary" onClick={this.endTurn}>End {this.state.game.game_status.isDay ? "day" : "night"}</button>
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
					if(!this.state.game.game_status.isDay){
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
								{infoList}
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
					       				<button type="button" className="btn btn-primary" onClick={this.endTurn}>End {this.state.game.game_status.isDay ? "day" : "night"}</button>
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
