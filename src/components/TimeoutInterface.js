import React, { Component } from 'react'

import store from '../store'
import '../css/timeoutinterface.css'

var SW = require('../utils/stateWrapper')


class TimeoutInterface extends Component {
  constructor(props) {
    super(props)

    this.state = {
      running: false,
      matchId: 0,
      timeoutBlamed: -1,
      account: store.getState().account.accountInstance,
      nujaBattle: store.getState().web3.nujaBattleInstance,
      timeoutManager: store.getState().web3.timeoutManagerInstance,
    }

    store.subscribe(() => {
      this.setState({
        account: store.getState().account.accountInstance,
        nujaBattle: store.getState().web3.nujaBattleInstance,
        timeoutManager: store.getState().web3.timeoutManagerInstance,
      })
    })
  }

  static defaultProps = {
    server: 0
  }

  componentWillMount() {
    var self = this

    // Get the current match
    if(self.state.nujaBattle != null && self.state.timeoutManager != null) {
      self.state.nujaBattle.methods.getServerState(self.props.server).call().then(function(serverState) {
        if(serverState == 2) {
          self.state.nujaBattle.methods.getServerCurrentMatch(self.props.server).call().then(function(matchId) {
            self.setState({matchId: matchId, running: true})

            // Check if pending timeout
            self.state.timeoutManager.methods.isTimeout(matchId).call().then(function(isTimeout) {
              if(isTimeout) {
                self.state.timeoutManager.methods.timeoutInfos(matchId).call().then(function(timeoutInfo) {
                  self.setState({timeoutBlamed: timeoutInfo.timeoutPlayerRet})
                })
              }
              else {
                self.setState({timeoutBlamed: -1})
              }
            })
          })
        }
        self.setState({running: false})
      })
    }
  }

  startTimeout(e) {
    e.preventDefault()
    var self = this

    // Parameters
    var metadata = []
    var move = []
    var moveOutput = []
    var signatureRS = []
    var v = []
    var nbSignature = 0

    if (this.state.nujaBattle != null) {
      var lastStates = SW.getLastStates()

      // Fill last state data
      var i = 0
      if(lastStates == null) {
        nbSignature = lastStates.length
        while(i < lastStates.length) {

          metadata.push(lastStates[i].metadata)
          move.push(lastStates[i].move)
          moveOutput.push(lastStates[i].moveOutput)

          var rHex = lastStates[i].signature.slice(0, 66)
          var sHex = '0x' + lastStates[i].signature.slice(66, 130)
          signatureRS.push([rHex, sHex])
          var splittedSig = ethjs.fromRpcSig(lastStates[i].signature)
          v.push(splittedSig.v)

          i++
        }
      }

      // Fill the remaining parameters with junk data
      for(; i<8; i++) {
        var tmp = []
        for(var j=0; j<3; j++) {
          tmp.push('0')
        }
        metadata.push(tmp)
        tmp = []
        for(j=0; j<4; j++) {
          tmp.push('0')
        }
        move.push(tmp)
        tmp = []
        for(j=0; j<176; j++) {
          tmp.push('0')
        }
        moveOutput.push(tmp)
        tmp = []
        for(j=0; j<2; j++) {
          tmp.push('')
        }
        signatureRS.push(tmp)
        v.push('0')
      }

      // Get origin state
      var originState = SW.getOriginState()
      if(originState == null) {
        originState = []
        for(i=0; i<176; i++) {
          originState.push('0')
        }
      }

      // If first turn, only metadata[0][0] has to hold the match id
      if(lastStates == null) {
        metadata[0][0] = self.state.matchId.toString()
      }

      self.state.nujaBattle.methods.startTimeout(metadata, move, moveOutput, signatureRS, v, originState, nbSignature).send({
        from: self.state.account.address,
        gasPrice: 2000000000,
        gas: '1000000'
      })
      .on('error', function(error){ console.log('ERROR: ' + error)})
      .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
      .on('receipt', function(receipt){ console.log('receipt')})
      .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
      .then(function(ret) {
        alert('Timeout processed')
      })
    }
  }

  stopTimeout(e) {
    e.preventDefault()
    var self = this

    self.state.nujaBattle.methods.stopTimeout(
      uint[3][8] metadata,
      uint[4][8] move,
      uint[176][8] moveOutput,
      bytes32[2][8] signatureRS,
      uint8[8] v,
      uint[176] originState,
      uint8 nbSignature
    ).send({
      from: self.state.account.address,
      gasPrice: 2000000000,
      gas: '1000000'
    })
    .on('error', function(error){ console.log('ERROR: ' + error)})
    .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
    .on('receipt', function(receipt){ console.log('receipt')})
    .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
    .then(function(ret) {
      alert('Player killed')
    })
  }

  confirmTimeout(e) {
    e.preventDefault()
    var self = this

    self.state.nujaBattle.methods.confirmTimeout(self.state.matchId).send({
      from: self.state.account.address,
      gasPrice: 2000000000,
      gas: '1000000'
    })
    .on('error', function(error){ console.log('ERROR: ' + error)})
    .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
    .on('receipt', function(receipt){ console.log('receipt')})
    .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
    .then(function(ret) {
      alert('Player killed')
    })
  }


  render() {
    var content = <div></div>

    if(this.state.running == true) {
      if(this.state.timeoutBlamed == -1) {
        // No timeout process is currently pending
        content =
          <div style={{textAlign: 'center'}}>
            <button style={{marginTop: '20px', marginBottom: '10px'}} onClick={this.startTimeout} className="buttonTimeout">Start timeout</button>
          </div>
      }
    }

    return (
      {content}
    )
  }
}

export default TimeoutInterface
