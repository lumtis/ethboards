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
      contract: store.getState().web3.contractInstance,
      nb: 0   // TODO: set player of server list instead
    }

    store.subscribe(() => {
      this.setState({
        contract: store.getState().web3.contractInstance,
      });
    });
  }

  static defaultProps = {
  }

  componentWillMount() {
    var self = this
    if (self.state.contract != null) {
      self.state.contract.methods.getCharacterNb().call().then(function(ret) {
        self.setState({nb: ret})
      });
    }
  }

  // componentDidUpdate() {
  //   var self = this
  //   if (self.state.contract != null) {
  //     self.state.contract.methods.getCharacterNb().call().then(function(ret) {
  //       self.setState({nb: ret})
  //     });
  //   }
  // }

  render() {
    var playerArray = []

    for (var i = 0; i < this.state.nb; i++) {
        playerArray.push(<PlayerSprite key={i} index={i}/>)
    }


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
        <div>{playerArray}</div>
      </div>
    );
  }
}

export default Map
