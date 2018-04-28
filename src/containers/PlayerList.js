import React, { Component } from 'react'

import Player from '../components/Player'

import store from '../store'

class PlayerList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      playerArray: [],
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
      });
    });
  }

  static defaultProps = {
    server: 0
  }

  componentWillMount() {
    var self = this
    if (self.state.nujaBattle != null) {
      self.state.nujaBattle.methods.getPlayerNb(self.props.server).call().then(function(nb) {
        // For each player, retreive informations
        for (var i = 0; i < nb; i++) {
          self.state.nujaBattle.methods.playerInformation(self.props.server, i).call().then(function(infoPlayer) {

            // Pushing in player array the new player
            var playerArrayTmp = self.state.playerArray
            playerArrayTmp.push(<div key={i} className="col-md-6"><Player index={infoPlayer.characterIndex}/></div>)
            self.setState({playerArray: playerArrayTmp})
          });
        }
      });
    }
  }

  render() {
    return (
        <div className="row">
          <div>{this.state.playerArray}</div>
        </div>
    );
  }
}

export default PlayerList
