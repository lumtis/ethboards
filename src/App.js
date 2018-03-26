import React, { Component } from 'react'
import getWeb3 from './utils/getWeb3'
import { default as Fade } from 'react-fade'
import PersistGate from 'redux-persist'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'


import store from './store'
// import persistor from './persistor'


import { Loop, Stage, World, TileMap, Sprite } from 'react-game-kit';



class App extends Component {

  constructor(props) {
    super(props)

    this.hasMetamask = -1

    this.state = {
      account: null
    }

    store.subscribe(() => {
      this.setState({
        account: store.getState().account.accountInstance
      });
    });
  }

  componentWillMount() {
    this.hasMetamask = getWeb3()
    this.restoreAccount()
  }

  restoreAccount() {
    if (localStorage.getItem("account") === null) {
      return
    } else {
      var accountStr = localStorage.getItem("account")
      if (accountStr == '') {
        return
      } else {
        store.dispatch({type: 'ACCOUNT_LOGIN', payload: {accountInstance: JSON.parse(accountStr)}})
      }
    }
  }


  randomGrass() {
    return Math.floor(Math.random() * Math.floor(3)) + 1;
  }

  randomForest() {
    return Math.floor(Math.random() * Math.floor(3)) + 4;
  }

  randomMountain() {
    return Math.floor(Math.random() * Math.floor(3)) + 7;
  }

  render() {
    const rows = 10
    const columns = 10

    var layers = []
    var layer = []

    // Pushing grasses
    for (var i = 0; i < rows; i++) {
      for (var j = 0; j < columns; j++) {
          // layer.push(this.randomGrass())
          layer[rows*i+j] = this.randomGrass()
      }
    }

    layers.push(layer)

    return (
      <div style={{height: '100%', width: '100%', position: 'absolute'}}>
      <Sprite
        repeat={true}
        src="images/nujaks/gif/spritePink.png"
        scale={this.context.scale * 2}
        state={0}
        steps={[0,1]}
      />
      </div>
    );
  }
}

export default App
