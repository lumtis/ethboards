import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'
import { Loop, Stage, World, TileMap, Sprite } from 'react-game-kit';

import PlayerSprite from '../components/PlayerSprite'
import Tile from '../components/Tile'

import store from '../store'


var noop = function() {};

class Map extends Component {
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
    if (self.state.contract != null) {
      self.state.nujaBattle.methods.getPlayerNb(self.props.server).call().then(function(nb) {

        // For each player, retreive informations
        for (var i = 0; i < nb; i++) {
          self.state.nujaBattle.methods.playerInformation(self.props.server, i).call().then(function(infoPlayer) {

            // Pushing in player array the new player
            var playerArrayTmp = self.state.playerArray
            playerArrayTmp.push(<PlayerSprite key={i} index={infoPlayer.characterIndex}/>)
            self.setState({playerArray: playerArrayTmp})
          });
        }
      });
    }
  }

  render() {
    const rows = 10
    const columns = 10

    var layers = []
    var tiles = []

    // Pushing grasses
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
          tiles[rows*i+j] = <Tile key={rows*i+j} x={i} y={j} />
      }
    }

    return (
      <div style={{
        height: '640px',
        width: '640px',
        position: 'absolute'
      }}>
        <div>{tiles}</div>
        <div>{this.state.playerArray}</div>
      </div>
    );
  }
}

export default Map
