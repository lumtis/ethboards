import React, { Component } from 'react'
import store from '../store'
import Map from '../containers/Map'
import WeaponSprite from '../components/WeaponSprite'
import Bar from '../components/Bar'


// TODO: Change the interface to be able to add weapon with building

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
    this.addBuilding = this.addBuilding.bind(this)
    this.removeBuilding = this.removeBuilding.bind(this)
    this.addWeapon = this.addWeapon.bind(this)

    this.state = {
      weaponRegistry: store.getState().web3.weaponRegistryInstance,
      nujaBattle: store.getState().web3.nujaBattleInstance,
      account: store.getState().account.accountInstance,
      atLeastOneServer: false,
      serverSelected: -1,
      serverArray: [],
      weaponArray: [],
    }

    store.subscribe(() => {
      this.setState({
        weaponRegistry: store.getState().web3.weaponRegistryInstance,
        nujaBattle: store.getState().web3.nujaBattleInstance,
        account: store.getState().account.accountInstance
      })
    })

  }

  static defaultProps = {
  }

  componentWillMount() {
    var self = this

    if (self.state.nujaBattle != null) {

      // Get all the servers of the user
      self.state.nujaBattle.methods.getServerUserNumber(self.state.account.address).call().then(function(serverNb) {

        // Enable this to be able to check the server
        if(serverNb > 0) {
          self.setState({atLeastOneServer: true})
        }

        for (var i = 0; i < serverNb; i++) {
          // For each server we add the button
          self.state.nujaBattle.methods.getServerUserIndex(self.state.account.address, i).call().then(function(serverIndex) {
            self.state.nujaBattle.methods.getServerName(serverIndex).call().then(function(serverName) {

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

  changeServer(serverId) {
    return function(e) {
      var self = this
      self.setState({serverSelected: serverId})
    }.bind(this)
  }

  addServer(e) {
    e.preventDefault();

    var name = this.refs.servername.value;
    var slot = parseInt(this.refs.slot.value);

    if (!name) {
      alert('name must not be empty')
    }
    else if(slot >= 2 && slot <= 10) {
      // Add the server
      if (this.state.nujaBattle != null) {
        this.state.nujaBattle.methods.addServer(name, slot).send({
          from: this.state.account.address,
          gasPrice: 2000000000,
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

  addBuilding(e) {
    e.preventDefault();

    var x = parseInt(this.refs.buildingx.value);
    var y = parseInt(this.refs.buildingy.value);

    if(x >= 0 && x < 10 && y >= 0 && y < 10) {
      // Add the server
      if (this.state.nujaBattle != null) {
        if(this.state.serverSelected >= 0) {
          this.state.nujaBattle.methods.addBuildingToServer(this.state.serverSelected, x, y).send({
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
    }
    else {
      alert('Invalid number (must be 0-9)')
    }
  }

  removeBuilding(e) {
    e.preventDefault();

    var x = parseInt(this.refs.buildingxremove.value);
    var y = parseInt(this.refs.buildingyremove.value);

    if(x >= 0 && x < 10 && y >= 0 && y < 10) {
      // Add the server
      if (this.state.nujaBattle != null) {
        if(this.state.serverSelected >= 0) {
          this.state.nujaBattle.methods.removeBuildingFromServer(this.state.serverSelected, x, y).send({
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
    }
    else {
      alert('Invalid number (must be 0-9)')
    }
  }

  addWeapon(idWeapon) {
    return function(e) {
      e.preventDefault();

      this.refs.buildingx.value = idWeapon
    }.bind(this)
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
        serverManagement =
          <div className="row" style={{padding: '30px'}}>
            <div className="col-md-12" style={{width:'100%', paddingLeft:'30px'}}>
              <Map key={this.state.serverSelected} server={this.state.serverSelected} />
            </div>
            <div className="col-md-12" style={{width:'100%', top:'660px'}}>

                <div className="row" style={{padding: '30px'}}>

                  <div className="col-md-6" style={{paddingRight:0, paddingLeft:0}}>
                    <div style={infoStyle}>
                      <form onSubmit={this.addBuilding}>
                        <h1 style={{marginBottom: '20px', marginTop: '0px'}}>Add building</h1>
                        <div className="form-group">
                          <input className="form-control" style={inputStyle} ref="buildingx" placeholder="X" type="text"/>
                        </div>
                        <div className="form-group">
                          <input className="form-control" style={inputStyle} ref="buildingy" placeholder="Y" type="text"/>
                        </div>
                        <div className="form-group">
                          <input className="form-control" style={inputStyle} ref="weaponid" placeholder="Weapon id" type="text"/>
                        </div>
                        <div className="form-group">
                          <button className='button' style={{margin:'20px'}}><i className="fa fa-arrow-right"><input style={{visibility:'hidden', position:'absolute'}} type="submit" ref="submit" value=''/></i></button>
                        </div>
                      </form>
                      <h1 style={{marginBottom: '20px', marginTop: '20px'}}>Select weapon</h1>
                      <div className="row">
                        {this.state.weaponArray}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6" style={{paddingRight:0, paddingLeft:0}}>
                    <div style={infoStyle}>
                      <form onSubmit={this.removeBuilding}>
                        <h1 style={{marginBottom: '20px', marginTop: '0px'}}>Remove building</h1>
                        <div className="form-group">
                          <input className="form-control" style={inputStyle} ref="buildingxremove" placeholder="X" type="text"/>
                        </div>
                        <div className="form-group">
                          <input className="form-control" style={inputStyle} ref="buildingyremove" placeholder="Y" type="text"/>
                        </div>
                        <div className="form-group">
                          <button className='button' style={{margin:'20px'}}><i className="fa fa-arrow-right"><input style={{visibility:'hidden', position:'absolute'}} type="submit" ref="submit" value=''/></i></button>
                        </div>
                      </form>
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
