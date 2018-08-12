/*
  Interface to make move in a match
*/

import React, { Component } from 'react'

import store from '../store'
import '../css/actions.css'

import WeaponSprite from '../components/WeaponSprite'
import KillInterface from '../components/KillInterface'
import TimeoutInterface from '../components/TimeoutInterface'
import InfoSpawn from '../components/InfoSpawn'


var PubSub = require('pubsub-js')
var SW = require('../utils/stateWrapper')


// Const for info spawn
var infoMove = "Moves to a neighbouring square. \
When clicking this button, crosses will appear on the map to show where the action can be perfomed. \
Click on a cross to validate the action. Some little delay may happen"

var infoAttack = "Attacks a neighbouring ennemy (30 damages). \
When clicking this button, crosses will appear on the map to show where the action can be perfomed. \
Click on a cross to validate the action. Some little delay may happen"

var infoExplore = "If you are in a building, you get the weapon inside the building. \
The building will then be empty"

var infoPower = "Performs the power of your character. \
When clicking this button, crosses will appear on the map to show where the action can be perfomed. \
Click on a cross to validate the action. Some little delay may happen"

var infoWeapon = "Performs the power of the selected weapon. \
Then the weapon will be consumed. \
When clicking on a weapon, crosses will appear on the map to show where the action can be perfomed. \
Click on a cross to validate the action. Some little delay may happen"

var infoIdle = "Do nothing for this turn"



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
      serverManager: store.getState().web3.serverManagerInstance,
      account: store.getState().account.accountInstance,
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
        serverManager: store.getState().web3.serverManagerInstance,
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
    if (self.state.nujaBattle != null && self.state.serverManager != null) {
      self.state.serverManager.methods.getPlayerMax(self.props.server).call().then(function(playerMax) {
        self.setState({playerMax: playerMax})
      })
      self.state.serverManager.methods.getIndexFromAddress(self.props.server, self.state.account.address).call().then(function(playerIndex) {
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

    if (self.state.nujaBattle != null && self.state.serverManager != null) {

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

        // Remove the crosses
        PubSub.publish('CROSSES', 'remove');

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
              <div className="col-md-11" style={{paddingRight:0, paddingLeft:0}}>
                <button style={{marginTop: '20px', marginBottom: '10px'}} onClick={this.moveButton} className="buttonExplore">Move <i className="fa fa-arrows-alt"></i></button>
              </div>
              <div className="col-md-1" style={{paddingRight:0, paddingLeft:0}}>
                <InfoSpawn infoContent={infoMove} />
              </div>
              <div className="col-md-11" style={{paddingRight:0, paddingLeft:0}}>
                <button style={{marginTop: '10px', marginBottom: '10px'}} onClick={this.attackButton} className="buttonExplore">Attack <i className="fa fa-gavel"></i></button>
              </div>
              <div className="col-md-1" style={{paddingRight:0, paddingLeft:0}}>
                <InfoSpawn infoContent={infoAttack} />
              </div>
              <div className="col-md-11" style={{paddingRight:0, paddingLeft:0}}>
                <button style={{marginTop: '10px', marginBottom: '10px'}} onClick={this.exploreBuildingButton} className="buttonExplore">Explore <i className="fa fa-building"></i></button>
              </div>
              <div className="col-md-1" style={{paddingRight:0, paddingLeft:0}}>
                <InfoSpawn infoContent={infoExplore} />
              </div>
              <div className="col-md-11" style={{paddingRight:0, paddingLeft:0}}>
                <button style={{marginTop: '10px', marginBottom: '10px'}} onClick={this.powerButton} className="buttonExplore">Power <i className="fa fa-star"></i></button>
              </div>
              <div className="col-md-1" style={{paddingRight:0, paddingLeft:0}}>
                <InfoSpawn infoContent={infoPower} />
              </div>
              <div className="col-md-11" style={{paddingRight:0, paddingLeft:0}}>
                <button style={{marginTop: '10px', marginBottom: '10px'}} onClick={this.idleButton} className="buttonExplore">Sleep <i className="fa fa-bed"></i></button>
              </div>
              <div className="col-md-1" style={{paddingRight:0, paddingLeft:0}}>
                <InfoSpawn infoContent={infoIdle} />
              </div>
            </div>
            <div className="col-md-11" style={{paddingRight:0, paddingLeft:0}}>
              <h3>Weapons:</h3>
            </div>
            <div className="col-md-1" style={{paddingRight:0, paddingLeft:0}}>
              <InfoSpawn infoContent={infoWeapon} />
            </div>
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
