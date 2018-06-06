import React, { Component } from 'react';


class Lobby extends Component {
	constructor(props) {
	  	super(props);

		this.navigateBack = this.navigateBack.bind(this);

	  	this.state = {	player_list: [this.props.player_name],
	  				};
	}

	navigateBack(){
		this.props.onPageChange("Welcome");	
	}





	render() {
		const playerList = this.state.player_list.map((playerName) =>
								<tr>
									<td>{playerName}</td>
								</tr>
							);
		return (
			<div>
				<div className="text-center">
					<h1>Game Lobby | Mafia - the party game</h1>

					<p>Hey {this.props.player_name}, Welcome to your game lobby </p>

					<div className ="container">
						<div class="card bg-primary text-white">
							<div class="card-body">Game ID: {this.props.game_id}</div>
						</div>
					</div>

				</div>
    			<br/>
    			<br/>

    			<div className="container">
	    			<table class="table table-dark table-hover table-bordered table-striped">

		    			<thead>
					      <tr>
					        <th>Player Name</th>
					      </tr>
					    </thead>

					    <tbody>
					      {playerList}
					    </tbody>
	    			</table>
	    		</div>
    			
    			<div className="text-center">
	    			<div className="container">
	  				<div className="row justify-content-center">
	  					<div className="col-2">
				       		<button type="button" className="btn btn-primary" onClick={this.createGame}>Start Game</button>
				       	</div>
				       	<div className="col-2">
				       		<button type="button" className="btn btn-primary" onClick={this.navigateBack}>Quit</button>
				       	</div>
				    </div>
				    </div>
		       		<br/>
		        
		       		<p id="errorMsg"></p>
		       	</div>
			</div>
		);
	}
}

export default Lobby;
