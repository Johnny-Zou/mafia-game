import React, { Component } from 'react';
import io from 'socket.io-client';

import './bootstrap.css';

import Welcome from './components/Welcome';
import JoinGame from './components/JoinGame';
import CreateGame from './components/CreateGame';
import Lobby from './components/Lobby';

var allowedPages = ["Welcome" , "JoinGame", "CreateGame", "Lobby"];

const serverIP = "ec2-18-191-123-240.us-east-2.compute.amazonaws.com:8080";

//Set up socket

class App extends Component {
	constructor(props){
		const socket = io.connect(serverIP);

		super(props);
		this.handleGameIDChange = this.handleGameIDChange.bind(this);
		this.handlePageChange = this.handlePageChange.bind(this);
		this.handleNameChange = this.handleNameChange.bind(this);
		this.state = {	page: "Welcome",
						player_name: "",
						game_id: "",
						client: socket
					};
	}

	handleGameIDChange(newGameID){
		this.setState({game_id: newGameID});
	}

	handlePageChange(newPage) {
		console.log(allowedPages.indexOf(toString(newPage)));
		if(allowedPages.indexOf(newPage) != -1){
			this.setState({page: newPage});
		}
  	}

  	handleNameChange(newName){
  		if(newName != ""){
  			this.setState({player_name: newName});
  		}
  	}


	render() {
		switch(this.state.page){
			case "Welcome":
				return (
					<Welcome player_name= {this.state.player_name} onPageChange = {this.handlePageChange} onNameChange = {this.handleNameChange}/>
				); 
			case "JoinGame":
				return (
					<JoinGame player_name = {this.state.player_name} onGameIDChange = {this.handleGameIDChange} onPageChange = {this.handlePageChange}/>
				);
			case "CreateGame":
				return (
					<CreateGame player_name = {this.state.player_name} onPageChange = {this.handlePageChange}/>
				);
			case "Lobby":
				return (
					<Lobby client = {this.state.client} player_name = {this.state.player_name} game_id = {this.state.game_id} onPageChange = {this.handlePageChange}/>
				);
			default:
				return (
					<div> An Error has occured </div>
				);
		}
	}
}

export default App;
