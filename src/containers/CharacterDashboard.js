import React, { Component } from 'react'
import store from '../store'
import Character from '../components/Character'



class CharacterDashboard extends Component {
  constructor(props) {
    super(props)

    this.state = {
      characterRegistry: store.getState().web3.characterRegistryInstance,
      account: store.getState().account.accountInstance,
      characterArray: []
      starterClaimed: true
    }

    store.subscribe(() => {
      this.setState({
        characterRegistry: store.getState().web3.characterRegistryInstance,
        account: store.getState().account.accountInstance,
      })
    })

  }

  static defaultProps = {
  }

  componentWillMount() {
    var self = this

    if (self.state.characterRegistry != null) {
      if (self.state.nujaRegistry != null) {
        self.state.characterRegistry.methods.isStarterClaimed(self.state.account.address).call().then(function(starterClaimed) {
          self.setState({starterClaimed: starterClaimed})
        })

        // Get every character
        self.state.characterRegistry.methods.balanceOf(self.state.account.address).call().then(function(characterNb) {
          for(var i = 0; i < characterNb; i++) {
            self.state.characterRegistry.methods.tokenOfOwnerByIndex(self.state.account.address, i).call().then(function(characterIndex) {

              var characterArrayTmp = self.state.characterArray
              characterArrayTmp.push(<div key={characterIndex} className="col-md-3"><Character charaterIndex={characterIndex} /></div>)
              self.setState({characterArray: characterArrayTmp})
            })
          }
        })
      }
    }
  }

  render() {

    var chooseStarter = <div></div>
    // If the user hasn't chosen his starter yet
    if(!this.state.starterClaimed) {

    }

    return(
      <div>
        <div className="row">
          {chooseStarter}
        </div>
        <div className="row">
          {this.state.characterArray}
        </div>
      </div>
    )
  }
}

export default CharacterDashboard
