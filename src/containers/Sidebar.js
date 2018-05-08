import React, { Component } from 'react'

import Player from '../components/Player'
import Actions from '../components/Actions'

import store from '../store'

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

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      account: store.getState().account.accountInstance,
      inServer: false,
      characterId: 0
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
            });
          });
        });
      }
    }
  }

  render() {
    var content = <div></div>

    // Get the content of the sidebar depending if we are on the server or not
    if (this.state.account == null) {
      content = <h3>Please install metamask</h3>
    }
    else {
      if (this.state.inServer) {
        content =
        <div>
          <Player index={this.state.characterId} />
          <Actions server={this.state.server} />
        </div>
      }
      else {
        content = <h3>You are not on this server</h3>
        // TODO: functionnality to join server
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
