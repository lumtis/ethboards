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

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      account: store.getState().account.accountInstance,
      inServer: false,
      characterId: 0,
      changeServer: false,
      changeServerByCharacter: false,
      serverRunning: true
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
  }

  componentWillMount() {
    var self = this;

    // Verify if user is on the server
    if (self.state.account != null) {
      if (self.state.nujaBattle != null) {
        self.state.nujaBattle.methods.isAddressInServer(self.props.server, self.state.account.address).call().then(function(isRet) {
          // If the user is on the server, we need to retreive the character id
          self.state.nujaBattle.methods.getIndexFromAddress(self.props.server, self.state.account.address).call().then(function(indexUser) {
            self.state.nujaBattle.methods.playerCharacter(self.props.server, indexUser).call().then(function(characterIndex) {
              self.setState({inServer: isRet, characterId: characterIndex})
            })
          })
        })

        // Check if the server is running
        // If it's not and we are not in it, we can join it
        self.state.nujaBattle.methods.isRunning(self.props.server).call().then(function(runningRet) {
          self.setState({serverRunning: runningRet})
        })
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

  render() {
    var content = <div></div>

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

        if (this.state.inServer) {
          // We are on the server, so we show our character informations and actions
          content =
          <div>
            {buttonChangeServer}
            <Player index={this.state.characterId} />
            <Actions server={this.state.server} />
          </div>
        }
        else {
          // Not in the server

          if(this.state.serverRunning) {
            var joinInt = <div></div>
          }
          else {
            joinInt = <JoinInterface server={this.state.server} />
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
      <div style={{backgroundColor: '#16D7AC', height: '100vh', overflowY: 'scroll'}}>
        <div style={{marginTop: '20px', padding: '20px'}}>
          {content}
        </div>
      </div>
    );
  }
}

export default Sidebar
