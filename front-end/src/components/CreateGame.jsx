import React, { Component } from 'react';

class CreateGame extends Component {
	constructor(props) {
	  	super(props);
		this.createGame = this.createGame.bind(this);
		this.navigateBack = this.navigateBack.bind(this);

		this.handleDetectiveNumChange = this.handleDetectiveNumChange.bind(this);
		this.handleMafiaNumChange = this.handleMafiaNumChange.bind(this);		
		this.handleDGuardianAngelNumChange = this.handleDGuardianAngelNumChange.bind(this);
		this.handleTownsPeopleNumChange = this.handleTownsPeopleNumChange.bind(this);

	  	this.state = {	errorName: false,
	  					detectiveNum: "1",
	  					mafiaNum: "1",
	  					guardianAngelNum: "1",
	  					townsPeopleNum: "fill"
	  				};
	}

	createGame(){
		const client = this.props.client;

		var data = {	player_id: this.props.player_id,
						detectiveNum: this.state.detectiveNum,
						mafiaNum: this.state.mafiaNum,
	  					guardianAngelNum: this.state.guardianAngelNum,
	  					townsPeopleNum: this.state.townsPeopleNum
					};
		var self = this;
		client.emit("createGame",data,function(callbackData){
			if(callbackData.success == true){
				self.props.onGameIDChange(callbackData.game_id);
				self.props.onPageChange("Lobby");
			}
		});
	}

	navigateBack(){
		this.props.onPageChange("Welcome");	
	}

	//handle select change
	handleDetectiveNumChange(e){
		this.setState({detectiveNum:e.target.value});
	}

	handleMafiaNumChange(e){
		this.setState({mafiaNum:e.target.value});
	}

	handleDGuardianAngelNumChange(e){
		this.setState({guardianAngelNum:e.target.value});
	}

	handleTownsPeopleNumChange(e){
		this.setState({townsPeopleNum:e.target.value});
	}


	render() {
		return (
			<div className="text-center">
				<h1>Create Game | Mafia - the party game</h1>

				<p>Hey {this.props.player_name}, set up your new game below!</p>
    			<div className="roleSelect row justify-content-center">
    				<div className="col-2">
    					<h5>Detective</h5>
    					<select onChange={this.handleDetectiveNumChange} className="form-control" id="detectiveAmount">
							<option>1</option>
							<option>2</option>
						</select>
    				</div>
    				<div className="col-2">
    					<h5>Mafia</h5>
    					<select onChange={this.handleMafiaNumChange} className="form-control" id="mafiaAmount">
							<option>1</option>
							<option>2</option>
							<option>3</option>
						</select>
    				</div>
    				<div className="col-2">
    					<h5>guardianAngel</h5>
    					<select onChange={this.handleDGuardianAngelNumChange} className="form-control" id="guardianAngelAmount">
							<option>1</option>
							<option>2</option>
						</select>
    				</div>
    				<div className="col-2">
    					<h5>townsPeople</h5>
    					<select onChange={this.handleTownsPeopleNumChange} className="form-control" id="townsPeopleAmount">
							<option>fill</option>
						</select>
    				</div>
    			</div>
    			<br/>
    			<div className="container">
  				<div className="row justify-content-center">
  					<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
			       		<button type="button" className="btn btn-primary" onClick={this.createGame}>Create Game</button>
			       	</div>
			       	<div className="col-6 col-sm-5 col-md-4 col-lg-3 col-xl-2">
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
