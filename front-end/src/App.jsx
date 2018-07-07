import React, { Component } from 'react';
import io from 'socket.io-client';

import './bootstrap.css';

import CreateProfile from './components/CreateProfile';
import Welcome from './components/Welcome';
import JoinGame from './components/JoinGame';
import CreateGame from './components/CreateGame';
import Lobby from './components/Lobby';
import GameScreen from './components/GameScreen'

var allowedPages = ["Welcome" , "JoinGame", "CreateGame", "Lobby", "GameScreen"];

const serverIP = "ec2-18-191-123-240.us-east-2.compute.amazonaws.com:8080";

//Set up socket

class App extends Component {
	constructor(props){
		const socket = io.connect(serverIP);

		super(props);
		this.handleGameIDChange = this.handleGameIDChange.bind(this);
		this.handlePageChange = this.handlePageChange.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
		this.handlePlayerIDChange = this.handlePlayerIDChange.bind(this);
		this.state = {	page: "Welcome",
						player_name: "",
						player_id: "",
						game_id: "",
						client: socket
					};
	}

	handleGameIDChange(newGameID){
		this.setState({game_id: newGameID});
	}

	handlePageChange(newPage) {
		if(allowedPages.indexOf(newPage) != -1){
			this.setState({page: newPage});
		}
  	}

  	handleNameChange(newName){
  		if(newName != ""){
  			this.setState({player_name: newName});
  		}
  	}

  	handlePlayerIDChange(newPlayerID){
  		if(newPlayerID != ""){
  			this.setState({player_id: newPlayerID});
  		}
  	}

	render() {
		switch(this.state.page){
			case "CreateProfile":
				return(
					<CreateProfile client = {this.state.client} onPageChange = {this.handlePageChange} onPlayerIDChange = {this.handlePlayerIDChange} onNameChange = {this.handleNameChange} />
				);
			case "Welcome":
				return (
					<Welcome player_name= {this.state.player_name} onPageChange = {this.handlePageChange}/>
				); 
			case "JoinGame":
				return (
					<JoinGame serverURL = {serverIP} player_id = {this.state.player_id} player_name = {this.state.player_name} onGameIDChange = {this.handleGameIDChange} onPageChange = {this.handlePageChange}/>
				);
			case "CreateGame":
				return (
					<CreateGame client = {this.state.client} player_id = {this.state.player_id} player_name = {this.state.player_name} onGameIDChange = {this.handleGameIDChange} onPageChange = {this.handlePageChange}/>
				);
			case "Lobby":
				return (
					<Lobby serverURL = {serverIP} client = {this.state.client} player_name = {this.state.player_name} game_id = {this.state.game_id} onPageChange = {this.handlePageChange}/>
				);
			case "GameScreen":
				return (
					<GameScreen serverURL = {serverIP} player_name = {this.state.player_name} player_id = {this.state.player_id} client = {this.state.client} game_id = {this.state.game_id}/>
				);
			default:
				return (
					<div> An Error has occured, no page selected</div>
				);
		}
	}
}

export default App;
