import React, { Component } from 'react'

import Player from '../components/Player'
import Actions from '../components/Actions'
import AllServers from '../components/AllServers'
import CharacterServers from '../components/CharacterServers'
import JoinInterface from '../components/JoinInterface'

import store from '../store'
import '../css/sidebar.css'

var noop = function() {};


var inputStyle = {
  width: '80%',
  margin: '0 auto',
  backgroundColor: 'rgba(236, 236, 236, 0.6)',
  borderRadius: 0,
  border: 0
};


class Sidebar extends Component {
  constructor(props) {
    super(props)

    this.changeServer = this.changeServer.bind(this)
    this.changeServerByCharacter = this.changeServerByCharacter.bind(this)

    this.quitServer = this.quitServer.bind(this)
    this.startServer = this.startServer.bind(this)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      account: store.getState().account.accountInstance,
      inServer: false,
      characterId: -1,
      changeServer: false,
      changeServerByCharacter: false,
      serverReady: false
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
        account: store.getState().account.accountInstance
      });
    });
  }

  static defaultProps = {
    server: 0,
    serverState: 0
  }

  componentWillReceiveProps(props) {
    var self = this;

    // Verify if user is on the server
    if (self.state.account != null) {
      if (self.state.nujaBattle != null) {
        self.state.nujaBattle.methods.isAddressInServer(props.server, self.state.account.address).call().then(function(isRet) {
          // If the user is on the server, we need to retreive the character id
          if(isRet) {
            self.state.nujaBattle.methods.getIndexFromAddress(props.server, self.state.account.address).call().then(function(indexUser) {
              self.state.nujaBattle.methods.playerCharacter(props.server, indexUser).call().then(function(characterIndex) {
                self.setState({characterId: parseInt(characterIndex)})
              })
            })
          }
          self.setState({inServer: isRet})
        })

        // Check if the server is ready
        if(parseInt(props.serverState) == 1) {
          self.state.nujaBattle.methods.getServerInfo(props.server).call().then(function(infoRet) {
            if(infoRet.playerMaxRet == infoRet.playerNbRet) {
              self.setState({serverReady: true})
            }
          })
        }
      }

    }
  }

  changeServer(e) {
    e.preventDefault();

    if (this.state.changeServer)
      this.setState({changeServer: false})
    else {
      this.setState({changeServer: true})
    }
  }

  changeServerByCharacter(e) {
    e.preventDefault();
    if (this.state.changeServerByCharacter)
      this.setState({changeServerByCharacter: false})
    else {
      this.setState({changeServerByCharacter: true})
    }
  }

  quitServer(e) {
    var self = this;
    if (self.state.account != null) {
      if (self.state.nujaBattle != null) {
        self.state.nujaBattle.methods.removePlayerFromServer(self.props.server).send({
          from: this.state.account.address,
          gasPrice: 2000000000,
          gas: 200000
          }
        )
        .on('error', function(error){ console.log('ERROR: ' + error)})
        .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
        .on('receipt', function(receipt){ console.log('receipt')})
        .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
        .then(function(ret) {
          alert('Server left')
        })
      }
    }
  }

  startServer(e) {
    var self = this;
    if (self.state.account != null) {
      if (self.state.nujaBattle != null) {
        self.state.nujaBattle.methods.startServer(this.props.server).send({
          from: this.state.account.address,
          gasPrice: 2000000000,
          gas: 1000000
          }
        )
        .on('error', function(error){ console.log('ERROR: ' + error)})
        .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
        .on('receipt', function(receipt){ console.log('receipt')})
        .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
        .then(function(ret) {
          alert('Server started')
        })
      }
    }
  }

  render() {
    var content = null

    // Get the content of the sidebar depending if we are on the server or not
    if (this.state.account == null) {
      content = <h3>Please install metamask</h3>
    }
    else {
      if (this.state.changeServer) {

        // We want to show available server
        var buttonReturn =
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <a onClick={this.changeServer}>
              <button className='buttonServer'><i className="fa fa-arrow-left"></i></button>
            </a>
          </div>

        if (this.state.changeServerByCharacter) {
          content =
            <div>
              {buttonReturn}
              <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <a onClick={this.changeServerByCharacter}>
                  <button className='buttonServer'>All servers</button>
                </a>
              </div>
              <h3>Your character's servers</h3>
              <CharacterServers />
            </div>
        }
        else {
          content =
            <div>
              {buttonReturn}
              <div style={{textAlign: 'center', marginBottom: '20px'}}>
                <a onClick={this.changeServerByCharacter}>
                  <button className='buttonServer'>By character</button>
                </a>
              </div>
              <h3>All servers</h3>
              <AllServers />
            </div>
        }
      }
      else {

        // Server actions
        var buttonChangeServer =
          <div style={{textAlign: 'center', marginBottom: '20px'}}>
            <a onClick={this.changeServer}>
              <button className='buttonServer'>change server</button>
            </a>
          </div>

        // Button to start the server
        var buttonStartServer = <h3>Waiting for opponents</h3>
        if(this.state.serverReady) {
          buttonStartServer =
            <div style={{textAlign: 'center', marginBottom: '20px'}}>
              <h3>Server is full</h3>
              <a onClick={this.startServer}>
                <button className='buttonServer'>start the server</button>
              </a>
            </div>
        }

        if (this.state.inServer) {

          if(this.props.serverState == 2) {
            // We are on the server, so we show our character informations and actions
            if(this.state.characterId > -1) {
              content =
              <div>
                <Player index={this.state.characterId} />
                <Actions server={this.props.server} />
              </div>
            }
          }
          else {
            // We are on the server but the match has not started yet
            content =
            <div>
              {buttonChangeServer}
              <h3>You are in</h3>
              {buttonStartServer}
              <div style={{textAlign: 'center', marginTop: '30px'}}>
                <a onClick={this.quitServer}>
                  <button className='buttonServer'>Quit server</button>
                </a>
              </div>
            </div>
          }
        }
        else {

          // Not in the server
          if(this.props.serverState == 0 || this.props.serverState == 2) {
            var joinInt = <div></div>
          }
          else {
            if(this.state.serverReady == false) {
              joinInt = <JoinInterface server={this.props.server} />
            }
          }

          content =
          <div>
            {buttonChangeServer}
            <h3>You are not on this server</h3>
            {joinInt}
          </div>
        }
      }
    }

    return (
      <div style={{backgroundColor: '#8559A5', height: '100vh', overflowY: 'scroll'}}>
        <div style={{marginTop: '20px', padding: '20px'}}>
          {content}
        </div>
      </div>
    );
  }
}

export default Sidebar
