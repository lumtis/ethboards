import React, { Component } from 'react'

class BoardList extends Component {
  constructor(props) {
    super(props)

    this.state = {
      boardArray: [],
    }
  }

  componentWillMount() {
    var self = this
    // Get every character
    self.state.characterRegistry.methods.balanceOf(self.state.account.address).call().then(function(characterNb) {
    for(var i = 0; i < characterNb; i++) {
        self.state.characterRegistry.methods.tokenOfOwnerByIndex(self.state.account.address, i).call().then(function(characterIndex) {

        var characterArrayTmp = self.state.characterArray
        characterArrayTmp.push(<div key={characterIndex} className="col-md-4"></div>)
        self.setState({characterArray: characterArrayTmp})
        })
    }
    })
  }

  render() {
    return(
      <div>
        <div className="row" style={{marginTop: '30px'}}>
          {this.state.characterArray}
        </div>
      </div>
    )
  }
}

export default BoardList
