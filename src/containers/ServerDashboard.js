import React, { Component } from 'react'
import store from '../store'
import Map from '../containers/Map'


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
  backgroundColor: 'rgba(240, 240, 240, 0.7)',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginBottom: '20px'
};


class ServerDashboard extends Component {
  constructor(props) {
    super(props)

    this.changeServer = this.changeServer.bind(this)
    this.addServer = this.addServer.bind(this)
    this.addBuilding = this.addBuilding.bind(this)
    this.addWeapon = this.addWeapon.bind(this)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      account: store.getState().account.accountInstance,
      serverSelected: 0,
      serverArray: []
    }

    store.subscribe(() => {
      this.setState({
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
      self.state.nujaBattle.methods.getServerUserNumber(self.state.account.address).call().then(function(serverNb) {
        for (var i = 0; i < serverNb; i++) {

          // For each server we add the button
          self.state.nujaBattle.methods.getServerUserNumber(self.state.account.address, i).call().then(function(serverIndex) {
            self.state.nujaBattle.methods.getServerName(serverIndex).call().then(function(serverName) {

              // Add server
              var serverArrayTmp = self.state.serverArray
              serverArrayTmp.push(
                <div key={this.serverIndex} style={infoStyle} className="col-md-12">
                  <a onClick={self.changeServer(this.serverIndex)}>
                    {serverName}
                  </a>
                </div>
              )
              self.setState({serverArray: serverArrayTmp})

            }.bind({serverIndex: serverIndex}))
          })

        }
      })
    }
  }

  changeServer(serverId) {
    return function(e) {
      this.setState({serverSelected: serverId})
    }.bind(this)
  }

  addServer(e) {
    e.preventDefault();

    var name = this.refs.name.value;
    var slot = parseInt(his.refs.slot.value);

    if(slot >= 2 && slot <= 10) {
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

    var x = parseInt(his.refs.buildingx.value);
    var y = parseInt(his.refs.buildingy.value);

    if(x >= 0 && x < 10 && y >= 0 && y < 10) {
      // Add the server
      if (this.state.nujaBattle != null) {
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
    else {
      alert('Invalid number (must be 0-9)')
    }
  }

  addWeapon(e) {
    e.preventDefault();
  }

  render() {
    return(
      <div>
        <div className="col-md-4" style={{paddingLeft:0, paddingRight:0}}>
          <form onSubmit={this.addServer}>
            <h1 style={{marginBottom: '20px', marginTop: '0px'}}>Create server</h1>
            <div className="form-group">
              <input className="form-control" style={inputStyle} ref="servername" placeholder="Name" type="text"/>
            </div>
            <div className="form-group">
              <input className="form-control" style={inputStyle} ref="slot" placeholder="Slot number (2->10)" type="text"/>
            </div>
            <div className="form-group">
              <button className='button' style={{margin:'20px', boxShadow:'5px 5px rgba(0, 0, 0, 1)'}}><i className="fa fa-arrow-right"><input style={{visibility:'hidden', position:'absolute'}} type="submit" ref="submit" value=''/></i></button>
            </div>
          </form>

          <h1 style={{marginBottom: '20px', marginTop: '0px'}}>List servers</h1>
          {serverArray}

        </div>
        <div className="col-md-8" style={{paddingRight:0, paddingLeft:0}}>

          <div className="row" style={{padding: '30px'}}>
            <div className="col-md-12" style={{width:'100%', paddingLeft:'30px'}}>
              <Map server={this.state.serverSelected} />
            </div>
            <div className="col-md-12" style={{width:'100%', top:'660px'}}>

                <div className="row" style={{padding: '30px'}}>

                  <div className="col-md-6" style={{paddingRight:0, paddingLeft:0}}>
                    <form onSubmit={this.addBuilding}>
                      <h1 style={{marginBottom: '20px', marginTop: '0px'}}>Add building</h1>
                      <div className="form-group">
                        <input className="form-control" style={inputStyle} ref="buildingx" placeholder="X" type="text"/>
                      </div>
                      <div className="form-group">
                        <input className="form-control" style={inputStyle} ref="buildingy" placeholder="Y" type="text"/>
                      </div>
                      <div className="form-group">
                        <button className='button' style={{margin:'20px', boxShadow:'5px 5px rgba(0, 0, 0, 1)'}}><i className="fa fa-arrow-right"><input style={{visibility:'hidden', position:'absolute'}} type="submit" ref="submit" value=''/></i></button>
                      </div>
                    </form>
                  </div>

                  <div className="col-md-6" style={{paddingRight:0, paddingLeft:0}}>
                    <form onSubmit={this.addWeapon}>
                      <h1 style={{marginBottom: '20px', marginTop: '0px'}}>Add weapon</h1>
                      <div className="form-group">
                        <button className='button' style={{margin:'20px', boxShadow:'5px 5px rgba(0, 0, 0, 1)'}}><i className="fa fa-arrow-right"><input style={{visibility:'hidden', position:'absolute'}} type="submit" ref="submit" value=''/></i></button>
                      </div>
                    </form>
                  </div>

                </div>

            </div>
          </div>

        </div>
      </div>
    )
  }
}

export default ServerDashboard
