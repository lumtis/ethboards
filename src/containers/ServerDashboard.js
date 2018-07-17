import React, { Component } from 'react'
import store from '../store'
import MapInitial from '../containers/MapInitial'
import WeaponSprite from '../components/WeaponSprite'
import Bar from '../components/Bar'

import '../css/serverdashboard.css'

var flatColorList = [
  '#55efc4',
  '#74b9ff',
  '#a29bfe',
  '#fab1a0',
  '#b2bec3',
  '#ffeaa7'
]

var inputStyle = {
  width: '80%',
  margin: '0 auto',
  backgroundColor: 'rgba(236, 236, 236, 0.6)',
  borderRadius: 0,
  border: 0
};

var inputStyleBuilding = {
  width: '80%',
  margin: '0 auto',
  backgroundColor: 'rgba(236, 236, 236, 0.6)',
  borderRadius: 0,
  border: 0
};

const infoStyle = {
  position: 'relative',
  padding: '20px',
  width: '80%',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 0.5)',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginBottom: '20px'
};

const chooseStyle = {
  position: 'relative',
  width: '100%',
  height: '65px',
};

class ServerDashboard extends Component {
  constructor(props) {
    super(props)

    this.changeServer = this.changeServer.bind(this)
    this.addServer = this.addServer.bind(this)

    this.addBuildings = this.addBuildings.bind(this)
    this.addNewBuilding = this.addNewBuilding.bind(this)
    this.updateAddBuildingXForm = this.updateAddBuildingXForm.bind(this)
    this.updateAddBuildingYForm = this.updateAddBuildingYForm.bind(this)
    this.addWeapon = this.addWeapon.bind(this)

    this.removeBuildings = this.removeBuildings.bind(this)
    this.removeNewBuilding = this.removeNewBuilding.bind(this)
    this.updateRemoveBuildingXForm = this.updateRemoveBuildingXForm.bind(this)
    this.updateRemoveBuildingYForm = this.updateRemoveBuildingYForm.bind(this)

    this.changeServerState = this.changeServerState.bind(this)

    this.state = {
      weaponRegistry: store.getState().web3.weaponRegistryInstance,
      nujaBattle: store.getState().web3.nujaBattleInstance,
      serverManager: store.getState().web3.serverManagerInstance,
      account: store.getState().account.accountInstance,
      atLeastOneServer: false,
      serverState: 0,
      playerNb: 0,
      serverSelected: -1,
      serverArray: [],
      weaponArray: [],

      addBuildingNb: 1,
      addBuildingX: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      addBuildingY: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      addBuildingWeapon: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

      removeBuildingNb: 1,
      removeBuildingX: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      removeBuildingY: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    }

    store.subscribe(() => {
      this.setState({
        weaponRegistry: store.getState().web3.weaponRegistryInstance,
        nujaBattle: store.getState().web3.nujaBattleInstance,
        serverManager: store.getState().web3.serverManagerInstance,
        account: store.getState().account.accountInstance
      })
    })

  }

  static defaultProps = {
  }

  componentWillMount() {
    var self = this

    if (self.state.nujaBattle != null && self.state.serverManager != null) {

      // Get all the servers of the user
      self.state.serverManager.methods.getServerUserNumber(self.state.account.address).call().then(function(serverNb) {

        // Enable this to be able to check the server
        if(serverNb > 0) {
          self.setState({atLeastOneServer: true})
        }

        for (var i = 0; i < serverNb; i++) {
          // For each server we add the button
          self.state.serverManager.methods.getServerUserIndex(self.state.account.address, i).call().then(function(serverIndex) {
            self.state.serverManager.methods.getServerName(serverIndex).call().then(function(serverName) {

              // Get a random color for background
              var ranIndex = Math.floor((Math.random() * flatColorList.length))
              var ranColor = flatColorList[ranIndex]

              // Add server
              var serverArrayTmp = self.state.serverArray
              serverArrayTmp.push(
                <div key={this.serverIndex} style={Object.assign({}, chooseStyle, {backgroundColor: ranColor})} className="col-md-12">
                  <a style={{cursor: 'pointer'}} onClick={self.changeServer(this.serverIndex)}>
                    <h1>{serverName}</h1>
                  </a>
                </div>
              )
              self.setState({serverArray: serverArrayTmp})

            }.bind({serverIndex: serverIndex}))
          })
        }
      })

      // Get server creation fee
      self.state.serverManager.methods.getServerCreationFee().call().then(function(serverCreationFee) {
          self.setState({serverCreationFee: serverCreationFee})
      })
    }

    if (self.state.weaponRegistry != null) {

      // Get all the weapon
      self.state.weaponRegistry.methods.getWeaponNumber().call().then(function(weaponNb) {
        for (var i = 0; i < weaponNb; i++) {
          var weaponArrayTmp = self.state.weaponArray
          weaponArrayTmp.push(
            <a key={i} onClick={self.addWeapon(i)}>
              <div style={{cursor: 'pointer'}} className="col-md-4">
                <WeaponSprite weaponIndex={i} />
              </div>
            </a>
          )
          self.setState({weaponArray: weaponArrayTmp})
        }
      })
    }
  }

  // Change current server
  changeServer(serverId) {
    return function(e) {
      var self = this

      // Get the state of the server
      if (self.state.nujaBattle != null && self.state.serverManager != null) {
        self.state.serverManager.methods.getServerState(serverId).call().then(function(serverState) {
          self.setState({serverSelected: serverId, serverState: serverState})
        })
        self.state.serverManager.methods.getPlayerNb(serverId).call().then(function(playerNb) {
          self.setState({playerNb: playerNb})
        })
      }
    }.bind(this)
  }

  addServer(e) {
    e.preventDefault();

    var name = this.refs.servername.value;
    var slot = parseInt(this.refs.slot.value);
    var fee = parseInt(this.refs.fee.value);
    var moneybag = parseInt(this.refs.moneybag.value);

    if (!name) {
      alert('name must not be empty')
    }
    else if(slot >= 2 && slot <= 10) {
      // Add the server
      if (this.state.nujaBattle != null) {
        this.state.serverManager.methods.addServer(name, slot, fee, moneybag).send({
          from: this.state.account.address,
          gasPrice: 2000000000,
          value: this.state.serverCreationFee
        })
        .on('error', function(error){ console.log('ERROR: ' + error)})
        .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
        .on('receipt', function(receipt){ console.log('receipt')})
        .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
        .then(function(ret) {
          alert('Server added')
        });
      }
    }
    else {
      alert('Invalid slot number (must be 2-10)')
    }
  }


  addBuildings(e) {
    e.preventDefault()

    // Add buildings to the server
    if (this.state.nujaBattle != null) {
      if(this.state.serverSelected >= 0) {
        this.state.serverManager.methods.addBuildingToServer(
          this.state.serverSelected,
          this.state.addBuildingX,
          this.state.addBuildingY,
          this.state.addBuildingWeapon,
          this.state.addBuildingNb
        ).send({
          from: this.state.account.address,
          gasPrice: 2000000000,
        })
        .on('error', function(error){ console.log('ERROR: ' + error)})
        .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
        .on('receipt', function(receipt){ console.log('receipt')})
        .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
        .then(function(ret) {
          alert('Building added')
        });
      }
    }
    else {
      alert('Invalid number (must be 0-9)')
    }
  }
  addNewBuilding(e) {
    e.preventDefault()

    if(this.state.addBuildingNb < 10) {
      this.setState({addBuildingNb: this.state.addBuildingNb+1})
    }
  }
  updateAddBuildingXForm(index) {
    return function(e) {
      e.preventDefault();

      // Changing the addBuildingX array
      var addBuildingXTmp = this.state.addBuildingX
      addBuildingXTmp[index] = parseInt(e.target.value)
      this.setState({addBuildingX: addBuildingXTmp})
    }.bind(this)
  }
  updateAddBuildingYForm(index) {
    return function(e) {
      e.preventDefault();

      // Changing the addBuildingY array
      var addBuildingYTmp = this.state.addBuildingY
      addBuildingYTmp[index] = parseInt(e.target.value)
      this.setState({addBuildingY: addBuildingYTmp})
    }.bind(this)
  }
  addWeapon(idWeapon) {
    return function(e) {
      e.preventDefault();

      // Changing the addBuildingWeapon array
      var addBuildingWeaponTmp = this.state.addBuildingWeapon
      addBuildingWeaponTmp[this.state.addBuildingNb-1] = idWeapon
      this.setState({addBuildingWeapon: addBuildingWeaponTmp})
    }.bind(this)
  }



  removeBuildings(e) {
    e.preventDefault()

    // Remove the server
    if (this.state.nujaBattle != null) {
      if(this.state.serverSelected >= 0) {
        this.state.serverManager.methods.removeBuildingFromServer(
          this.state.serverSelected,
          this.state.removeBuildingX,
          this.state.removeBuildingY,
          this.state.removeBuildingNb,
        ).send({
          from: this.state.account.address,
          gasPrice: 2000000000,
        })
        .on('error', function(error){ console.log('ERROR: ' + error)})
        .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
        .on('receipt', function(receipt){ console.log('receipt')})
        .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
        .then(function(ret) {
          alert('Building added')
        });
      }
    }
    else {
      alert('Invalid number (must be 0-9)')
    }
  }
  removeNewBuilding(e) {
    e.preventDefault()

    if(this.state.removeBuildingNb < 10) {
      this.setState({removeBuildingNb: this.state.removeBuildingNb+1})
    }
  }
  updateRemoveBuildingXForm(index) {
    return function(e) {
      e.preventDefault();

      // Changing the removeBuildingX array
      var removeBuildingXTmp = this.state.removeBuildingX
      removeBuildingXTmp[index] = parseInt(e.target.value)
      this.setState({removeBuildingX: removeBuildingXTmp})
    }.bind(this)
  }
  updateRemoveBuildingYForm(index) {
    return function(e) {
      e.preventDefault();

      // Changing the removeBuildingY array
      var removeBuildingYTmp = this.state.removeBuildingY
      removeBuildingYTmp[index] = parseInt(e.target.value)
      this.setState({removeBuildingY: removeBuildingYTmp})
    }.bind(this)
  }


  changeServerState(e) {
    e.preventDefault();
    var self = this

    if (self.state.nujaBattle != null && self.state.serverManager != null) {
      if(self.state.serverState == 0) {

        // If server is offline, we set it online
        self.state.serverManager.methods.setServerOnline(self.state.serverSelected).send({
          from: self.state.account.address,
          gasPrice: 2000000000,
        })
        .on('error', function(error){ console.log('ERROR: ' + error)})
        .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
        .on('receipt', function(receipt){ console.log('receipt')})
        .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
        .then(function(ret) {
          alert('Server online')
        });
      }
      else if (self.state.serverState == 1) {

        // If server is online, we set it offline
        self.state.serverManager.methods.setServerOffline(self.state.serverSelected).send({
          from: self.state.account.address,
          gasPrice: 2000000000,
        })
        .on('error', function(error){ console.log('ERROR: ' + error)})
        .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
        .on('receipt', function(receipt){ console.log('receipt')})
        .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
        .then(function(ret) {
          alert('Server offlone')
        });
      }
    }
  }

  render() {
    var serverManagement =
      <div>
        <h1>You have no server</h1>
      </div>
    if (this.state.atLeastOneServer == true) {
      if(this.state.serverSelected < 0) {
        serverManagement =
          <div>
            <h1>Choose a server</h1>
          </div>
      }
      else {

        var addBuildingForm = <div></div>
        if(this.state.serverState == 0) {
          // Form for adding building is specific:
          // its size change depending on how many building user want to add
          // unlike other form, all value are manage with react state
          var addBuildingFormList = []
          for(var i = 0; i<this.state.addBuildingNb; i++) {
            addBuildingFormList.push(
              <div key={i}>
                <div className="col-md-4">
                  <input type="text" style={inputStyleBuilding} value={this.state.addBuildingX[i].toString()} onChange={this.updateAddBuildingXForm(i)} />
                </div>
                <div className="col-md-4">
                  <input type="text" style={inputStyleBuilding} value={this.state.addBuildingY[i].toString()} onChange={this.updateAddBuildingYForm(i)} />
                </div>
                <div className="col-md-4">
                  <input type="text" style={inputStyleBuilding} value={this.state.addBuildingWeapon[i]} />
                </div>
              </div>
            )
          }
          addBuildingForm =
          <div>
            <h1 style={{marginBottom: '20px', marginTop: '0px'}}>Add buildings</h1>
            <div className="row">
              <div className="col-md-4">
                <h3 style={{fontSize: '12px'}}>X</h3>
              </div>
              <div className="col-md-4">
                <h3 style={{fontSize: '12px'}}>Y</h3>
              </div>
              <div className="col-md-4">
                <h3 style={{fontSize: '12px'}}>Weapon ID</h3>
              </div>
              {addBuildingFormList}
            </div>
            <a onClick={this.addNewBuilding}>
              <button style={{marginBottom: '20px', marginTop: '20px'}} className='buttonServer'>+</button>
            </a>
            <a onClick={this.addBuildings}>
              <button style={{marginBottom: '20px', marginTop: '20px'}} className='buttonServer'>Add buildings</button>
            </a>
            <h1 style={{marginBottom: '20px', marginTop: '20px'}}>Select weapon:</h1>
            <div className="row">
              {this.state.weaponArray}
            </div>
          </div>
        }

        var removeBuildingForm = <div></div>
        if(this.state.serverState == 0) {
          // Same for removing building
          var removeBuildingFormList = []
          for(var i = 0; i<this.state.removeBuildingNb; i++) {
            removeBuildingFormList.push(
              <div key={i}>
                <div className="col-md-6">
                  <input type="text" style={inputStyleBuilding} value={this.state.removeBuildingX[i].toString()} onChange={this.updateRemoveBuildingXForm(i)} />
                </div>
                <div className="col-md-6">
                  <input type="text" style={inputStyleBuilding} value={this.state.removeBuildingY[i].toString()} onChange={this.updateRemoveBuildingYForm(i)} />
                </div>
              </div>
            )
          }
          removeBuildingForm =
          <div>
            <h1 style={{marginBottom: '20px', marginTop: '0px'}}>Remove buildings</h1>
            <div className="row">
              <div className="col-md-6">
                <h3 style={{fontSize: '12px'}}>X</h3>
              </div>
              <div className="col-md-6">
                <h3 style={{fontSize: '12px'}}>Y</h3>
              </div>
              {removeBuildingFormList}
            </div>
            <a onClick={this.removeNewBuilding}>
              <button style={{marginBottom: '20px', marginTop: '20px'}} className='buttonServer'>+</button>
            </a>
            <a onClick={this.removeBuildings}>
              <button style={{marginBottom: '20px', marginTop: '20px'}} className='buttonServer'>Remove buildings</button>
            </a>
          </div>
        }

        // Button to set server state
        var serverStateButton = <h3>Server is running</h3>
        if(this.state.serverState == 0) {
          serverStateButton =
            <div style={{float: 'right'}}>
              <a onClick={this.changeServerState}>
                <button className='buttonOnline'>Set online</button>
              </a>
            </div>
        }
        else if(this.state.serverState == 1) {

          // If players are already in the server we can put it offline
          if(this.state.playerNb > 0) {
            serverStateButton = <h3>Waiting for players</h3>
          }
          else {
            serverStateButton =
              <div style={{float: 'right'}}>
                <a onClick={this.changeServerState}>
                  <button className='buttonOffline'>Set offline</button>
                </a>
              </div>
          }
        }

        // Interface for managing one server
        serverManagement =
          <div className="row" style={{padding: '30px'}}>
            <div className="col-md-12" style={{paddingRight:0, paddingLeft:0}}>
              {serverStateButton}
            </div>
            <div className="col-md-12" style={{width:'100%', paddingLeft:'30px'}}>
              <MapInitial key={this.state.serverSelected} server={this.state.serverSelected} />
            </div>
            <div className="col-md-12" style={{width:'100%', top:'540px'}}>

                <div className="row" style={{padding: '30px'}}>
                  <div className="col-md-6" style={{paddingRight:0, paddingLeft:0}}>
                    <div style={infoStyle}>
                      {addBuildingForm}
                    </div>
                  </div>

                  <div className="col-md-6" style={{paddingRight:0, paddingLeft:0}}>
                    <div style={infoStyle}>
                      {removeBuildingForm}
                    </div>
                  </div>
                </div>
            </div>
          </div>
      }
    }

    return(
      <div>
        <Bar style={{paddingRight:'10px'}} />
        <div className="col-md-4" style={{paddingLeft:0, paddingRight:0}}>

          <div style={{padding: '30px'}}>
            <div style={infoStyle}>
              <form onSubmit={this.addServer}>
                <h1 style={{marginBottom: '20px', marginTop: '0px'}}>Create server</h1>
                <div className="form-group">
                  <input className="form-control" style={inputStyle} ref="servername" placeholder="Name" type="text"/>
                </div>
                <div className="form-group">
                  <input className="form-control" style={inputStyle} ref="slot" placeholder="Slot number (2->10)" type="text"/>
                </div>
                <div className="form-group">
                  <input className="form-control" style={inputStyle} ref="fee" placeholder="Server fee (finney)" type="text"/>
                </div>
                <div className="form-group">
                  <input className="form-control" style={inputStyle} ref="moneybag" placeholder="Money bag(finney)" type="text"/>
                </div>
                <div className="form-group">
                  <h3 style={{fontSize: '14px'}}>Server creation fee: {this.state.serverCreationFee/1000000000000000000} ETH</h3>
                </div>
                <div className="form-group">
                  <button className='button' style={{margin:'20px'}}><i className="fa fa-arrow-right"><input style={{visibility:'hidden', position:'absolute'}} type="submit" ref="submit" value=''/></i></button>
                </div>
              </form>
            </div>
          </div>

          <div style={infoStyle}>
            <h1 style={{marginBottom: '20px', marginTop: '0px'}}>My servers</h1>
            <div className="row">
              {this.state.serverArray}
            </div>
          </div>

        </div>
        <div className="col-md-8" style={{paddingRight:0, paddingLeft:0}}>
          {serverManagement}
        </div>
      </div>
    )
  }
}

export default ServerDashboard
