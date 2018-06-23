/*
  Interface to make move in a match
*/

import React, { Component } from 'react'

import store from '../store'
import '../css/actions.css'

import WeaponSprite from '../components/WeaponSprite'
import KillInterface from '../components/KillInterface'
import TimeoutInterface from '../components/TimeoutInterface'

var PubSub = require('pubsub-js')
var SW = require('../utils/stateWrapper')


class Actions extends Component {
  constructor(props) {
    super(props)

    this.moveButton = this.moveButton.bind(this)
    this.attackButton = this.attackButton.bind(this)
    this.exploreBuildingButton = this.exploreBuildingButton.bind(this)
    this.powerButton = this.powerButton.bind(this)
    this.weaponButton = this.weaponButton.bind(this)
    this.idleButton = this.idleButton.bind(this)

    this.getMessage = this.getMessage.bind(this)
    var token = PubSub.subscribe('CROSSES', this.getMessage)

    this.state = {
      moveSelected: false,
      attackSelected: false,
      weaponSelected: false,
      powerSelected: false,
      selectedWeapon: 0,
      playerIndex: -1,
      playerMax: 0,
      nujaBattle: store.getState().web3.nujaBattleInstance,
      account: store.getState().account.accountInstance,
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
        account: store.getState().account.accountInstance,
      });
    });
  }

  static defaultProps = {
    server: 0
  }

  componentWillMount() {
    var self = this

    // necessary informations from server
    if (self.state.nujaBattle != null) {
      self.state.nujaBattle.methods.getPlayerMax(self.props.server).call().then(function(playerMax) {
        self.setState({playerMax: playerMax})
      })
      self.state.nujaBattle.methods.getIndexFromAddress(self.props.server, self.state.account.address).call().then(function(playerIndex) {
        self.setState({playerIndex: playerIndex})
      })
    }
  }

  moveButton(e) {
    e.preventDefault();

    if(this.state.moveSelected) {
      this.setState({moveSelected: false})
      PubSub.publish('CROSSES', 'remove');
    }
    else {
      this.setState({
        moveSelected: true,
        attackSelected: false,
        weaponSelected: false,
        powerSelected: false,
      })
      PubSub.publish('CROSSES', 'remove');

      // We search for every field which gives more than 0 gas (which means that the transaction will not revert)
      for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
          this.state.nujaBattle.methods.simulate(this.props.server, this.state.playerIndex, 0, i, j, 0, SW.getCurrentState()).estimateGas({gas: '1000000'}, function(error, gasAmount){
            // If gas superior than 0 we draw a cross
            if(error == null) {
              if(gasAmount > 0) {
                PubSub.publish('CROSSES', 'add ' + this.i + ' ' + this.j);
              }
            }
          }.bind({i: i, j: j}));
        }
      }
    }
  }
  attackButton(e) {
    e.preventDefault();

    if(this.state.attackSelected) {
      this.setState({attackSelected: false})
      PubSub.publish('CROSSES', 'remove');
    }
    else {
      this.setState({
        moveSelected: false,
        attackSelected: true,
        weaponSelected: false,
        powerSelected: false,
      })
      PubSub.publish('CROSSES', 'remove');

      for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
          this.state.nujaBattle.methods.simulate(this.props.server, this.state.playerIndex, 1, i, j, 0, SW.getCurrentState()).estimateGas({gas: '1000000'}, function(error, gasAmount){
            // If gas superior than 0 we draw a cross
            if(error == null) {
              if(gasAmount > 0) {
                PubSub.publish('CROSSES', 'add ' + this.i + ' ' + this.j);
              }
            }
          }.bind({i: i, j: j}));
        }
      }
    }
  }
  exploreBuildingButton(e) {
    e.preventDefault();
    this.command(2, 0, 0)
  }
  powerButton(e) {
    e.preventDefault();
    if(this.state.powerSelected) {
      this.setState({powerSelected: false})
      PubSub.publish('CROSSES', 'remove');
    }
    else {
      this.setState({
        moveSelected: false,
        attackSelected: false,
        weaponSelected: false,
        powerSelected: true,
      })
      PubSub.publish('CROSSES', 'remove');

      for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
          this.state.nujaBattle.methods.simulate(this.props.server, this.state.playerIndex, 4, i, j, 0, SW.getCurrentState()).estimateGas({gas: '1000000'}, function(error, gasAmount){

            // If gas superior than 0 we draw a cross
            if(error == null) {
              if(gasAmount > 0) {
                PubSub.publish('CROSSES', 'add ' + this.i + ' ' + this.j);
              }
            }
          }.bind({i: i, j: j}));
        }
      }
    }
  }
  weaponButton(id) {
    return function(e) {
      e.preventDefault();
      if(this.state.weaponSelected && id == this.state.selectedWeapon) {
        this.setState({weaponSelected: false})
        PubSub.publish('CROSSES', 'remove');
      }
      else {
        this.setState({
          moveSelected: false,
          attackSelected: false,
          weaponSelected: true,
          powerSelected: false,
          selectedWeapon: id,
        })
        PubSub.publish('CROSSES', 'remove');

        for (var i = 0; i < 10; i++) {
          for (var j = 0; j < 10; j++) {
            this.state.nujaBattle.methods.simulate(this.props.server, this.state.playerIndex, 3, i, j, id, SW.getCurrentState()).estimateGas({gas: '1000000'}, function(error, gasAmount){

              // If gas superior than 0 we draw a cross
              if(error == null) {
                if(gasAmount > 0) {
                  PubSub.publish('CROSSES', 'add ' + this.i + ' ' + this.j);
                }
              }
            }.bind({i: i, j: j}));
          }
        }
      }
    }.bind(this)
  }

  idleButton(e) {
    e.preventDefault();
    this.command(5, 0, 0)
  }


  command(playMove, x, y) {
    var self = this

    if (self.state.nujaBattle != null) {

      // Simulate the turn to get move output
      self.state.nujaBattle.methods.simulate(self.props.server, self.state.playerIndex, playMove, x, y, self.state.selectedWeapon, SW.getCurrentState()).call({gas: '1000000'}).then(function(moveOutput) {
        // Creating signature
        var metadata = []
        metadata.push(SW.getCurrentMatch())
        var currentTurn = SW.getCurrentTurn(self.state.playerMax)
        metadata.push(currentTurn[0])
        metadata.push(currentTurn[1])

        var move = []
        move.push(playMove)
        move.push(x)
        move.push(y)
        move.push(self.state.selectedWeapon)

        // Pushing the signature to the server
        SW.pushSignature(SW.getCurrentMatch(), metadata, move, moveOutput)
      })
    }
  }

  // Get message from action component to decide which cross has been pressed
  getMessage(msg, data) {
    var dataArray = data.split(' ')

    // Cross pressed
    if(dataArray[0] == 'pressed') {
      if(this.state.moveSelected) {
        this.command(0, parseInt(dataArray[1]), parseInt(dataArray[2]))
      }
      else if(this.state.attackSelected) {
        this.command(1, parseInt(dataArray[1]), parseInt(dataArray[2]))
      }
      else if(this.state.weaponSelected) {
        this.command(3, parseInt(dataArray[1]), parseInt(dataArray[2]))
      }
      else if(this.state.powerSelected) {
        this.command(4, parseInt(dataArray[1]), parseInt(dataArray[2]))
      }
    }
  }


  render() {
    var content = null
    var myTurn = false
    var weaponArray = []

    if(this.state.playerMax > 0 && this.state.playerIndex != -1) {
      // Check if it is the player turn
      var actualTurn = SW.getCurrentTurn(this.state.playerMax)

      if(actualTurn[1] == this.state.playerIndex) {
        myTurn = true

        // Get weapon from player
        var weapons = SW.getPlayerWeapons(this.state.playerIndex)

        for (var i = 0; i < weapons.length; i++) {
          weaponArray.push(
            <div key={i} className="col-md-3">
              <button onClick={this.weaponButton(i)} style={{
                borderWidth: '0px',
                backgroundColor: 'rgba(240, 240, 240, 0.0)',
              }}>
                <WeaponSprite weaponIndex={weapons[i]}/>
              </button>
            </div>)
        }
      }

      if(myTurn) {
        content =
          <div style={{padding: '2px'}}>
            <h3>Your turn !</h3>
            <div style={{textAlign: 'center'}}>
              <button style={{marginTop: '20px', marginBottom: '10px'}} onClick={this.moveButton} className="buttonExplore">Move <i className="fa fa-arrows-alt"></i></button>
              <button style={{marginTop: '10px', marginBottom: '10px'}} onClick={this.attackButton} className="buttonExplore">Attack <i className="fa fa-gavel"></i></button>
              <button style={{marginTop: '10px', marginBottom: '10px'}} onClick={this.exploreBuildingButton} className="buttonExplore">Explore <i className="fa fa-building"></i></button>
              <button style={{marginTop: '10px', marginBottom: '10px'}} onClick={this.powerButton} className="buttonExplore">Power <i className="fa fa-star"></i></button>
              <button style={{marginTop: '10px', marginBottom: '10px'}} onClick={this.idleButton} className="buttonExplore">Sleep <i className="fa fa-bed"></i></button>
            </div>
            <h3>Weapons:</h3>
            <div className="row" style={{marginTop: '20px', marginBottom: '20px'}}>
              <div>{weaponArray}</div>
            </div>
          </div>
      }
      else {
        content = <h3>Not your turn</h3>
      }

      return (
        <div>
          {content}
          <KillInterface server={this.props.server} />
          <TimeoutInterface server={this.props.server} turn={actualTurn[0]} turnPlayer={actualTurn[1]} />
        </div>
      );
    }

    return (null)
  }
}

export default Actions
