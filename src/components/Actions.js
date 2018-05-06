import React, { Component } from 'react'

import store from '../store'
import '../css/actions.css'

import WeaponSprite from '../components/WeaponSprite'

var PubSub = require('pubsub-js')

// TODO: Implement weapon and nuja power

class Actions extends Component {
  constructor(props) {
    super(props)

    this.moveButton = this.moveButton.bind(this);
    this.attackButton = this.attackButton.bind(this);
    this.exploreBuildingButton = this.exploreBuildingButton.bind(this);
    this.powerButton = this.powerButton.bind(this);
    this.weaponButton = this.weaponButton.bind(this);
    this.idleButton = this.idleButton.bind(this);

    this.getMessage = this.getMessage.bind(this);
    var token = PubSub.subscribe('CROSSES', this.getMessage);

    this.state = {
      moveSelected: false,
      attackSelected: false,
      weaponSelected: false,
      powerSelected: false,
      selectedWeapon: 0,
      weaponArray: [],
      nujaBattle: store.getState().web3.nujaBattleInstance,
      account: store.getState().account.accountInstance,
      myTurn: false
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
        account: store.getState().account.accountInstance
      });
    });
  }

  static defaultProps = {
    server: 0
  }

  componentWillMount() {
    var self = this
    if (self.state.nujaBattle != null) {
      self.state.nujaBattle.methods.isTurn(self.props.server, self.state.account.address).call().then(function(ret) {
        self.setState({myTurn: ret})

        if(ret == true) {
          // Create button for every player's weapon
          self.state.nujaBattle.methods.getIndexFromAddress(self.props.server, self.state.account.address).call().then(function(playerIndex) {
            self.state.nujaBattle.methods.playerInformation(self.props.server, playerIndex).call().then(function(playerInfo) {
              // For each weapon, retreive id
              for (var i = 0; i < playerInfo.weaponNumber; i++) {
                self.state.nujaBattle.methods.playerWeapons(self.props.server, playerIndex, i).call().then(function(weaponId) {
                  self.state.nujaBattle.methods.getWeaponAddress(self.props.server, weaponId).call().then(function(weaponAddress) {
                    var weaponArrayTmp = self.state.weaponArray

                    // Push to weapon array the sprite of the weapon wrapped by the callback button
                    weaponArrayTmp.push(
                      <div key={this.userWeaponId} className="col-md-3">
                        <button onClick={self.weaponButton(this.userWeaponId)} style={{
                          borderWidth: '0px',
                          backgroundColor: 'rgba(240, 240, 240, 0.0)',
                        }}>
                          <WeaponSprite contractAddress={weaponAddress}/>
                        </button>
                      </div>)
                    self.setState({weaponArray: weaponArrayTmp})
                  }.bind(this));
                }.bind({userWeaponId: i}));
              }
            });
          });
        }
      });
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
          this.state.nujaBattle.methods.play(this.props.server, 0, i, j, 0).estimateGas({from: this.state.account.address}, function(error, gasAmount){
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
          this.state.nujaBattle.methods.play(this.props.server, 1, i, j, 0).estimateGas({from: this.state.account.address}, function(error, gasAmount){
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
          this.state.nujaBattle.methods.play(this.props.server, 4, i, j, 0).estimateGas({from: this.state.account.address}, function(error, gasAmount){

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
            this.state.nujaBattle.methods.play(this.props.server, 3, i, j, id).estimateGas({from: this.state.account.address}, function(error, gasAmount){

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
    if (this.state.nujaBattle != null) {
      this.state.nujaBattle.methods.play(this.props.server, playMove, x, y, this.state.selectedWeapon).send({
        from: this.state.account.address,
        gasPrice: 2000000000,
      })
      .on('error', function(error){ console.log('ERROR: ' + error)})
      .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
      .on('receipt', function(receipt){ console.log('receipt')})
      .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
      .then(function(ret) {
        alert('Done')
      });
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
    var content = <div></div>

    if(this.state.myTurn) {
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
          <div>{this.state.weaponArray}</div>
        </div>
      </div>
    }
    else {
      content = <h3>Not your turn</h3>
    }

    return (
      <div>{content}</div>
    );
  }
}

export default Actions
