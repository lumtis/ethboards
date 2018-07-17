import React, { Component } from 'react'

import store from '../store'
import '../css/timeoutinterface.css'

var ethjs = require('ethereumjs-util')


var SW = require('../utils/stateWrapper')


class TimeoutInterface extends Component {
  constructor(props) {
    super(props)

    this.startTimeout = this.startTimeout.bind(this)
    this.stopTimeout = this.stopTimeout.bind(this)
    this.confirmTimeout = this.confirmTimeout.bind(this)
    this.updateRemainingTime = this.updateRemainingTime.bind(this)

    this.state = {
      running: false,
      matchId: 0,
      playerMax: 2,
      playerIndex: 0,
      timeoutBlamed: -1,
      remainingTime: 0,
      timeoutTurn: 0,
      timeoutPlayerTurn: 0,
      account: store.getState().account.accountInstance,
      nujaBattle: store.getState().web3.nujaBattleInstance,
      timeoutStarter: store.getState().web3.timeoutStarterInstance,
      timeoutStopper: store.getState().web3.timeoutStopperInstance,
    }

    store.subscribe(() => {
      this.setState({
        account: store.getState().account.accountInstance,
        nujaBattle: store.getState().web3.nujaBattleInstance,
        timeoutStarter: store.getState().web3.timeoutStarterInstance,
        timeoutStopper: store.getState().web3.timeoutStopperInstance,
      })
    })
  }

  static defaultProps = {
    server: 0,
    turn: 0,
    turnPlayer: 0
  }

  componentWillMount() {
    var self = this

    // Get the current match
    if(self.state.nujaBattle != null && self.state.timeoutStarter != null && self.state.timeoutStopper != null) {

      // Get server player max
      self.state.nujaBattle.methods.getPlayerMax(self.props.server).call().then(function(playerMax) {
        self.setState({playerMax: playerMax})
      })
      self.state.nujaBattle.methods.getIndexFromAddress(self.props.server, self.state.account.address).call().then(function(playerIndex) {
        self.setState({playerIndex: playerIndex})
      })

      self.state.nujaBattle.methods.getServerState(self.props.server).call().then(function(serverState) {
        if(serverState == 2) {
          self.state.nujaBattle.methods.getServerCurrentMatch(self.props.server).call().then(function(matchId) {
            self.setState({matchId: matchId, running: true})


            // Check if pending timeout
            self.state.timeoutStarter.methods.isTimeout(matchId).call().then(function(isTimeout) {
              if(isTimeout) {
                self.state.timeoutStarter.methods.timeoutInfos(matchId).call().then(function(timeoutInfo) {
                  // Set timeout info
                  self.setState({
                    timeoutBlamed: timeoutInfo.timeoutPlayerRet,
                    timeoutTurn: timeoutInfo.timeoutTurnRet,
                    timeoutPlayerTurn: timeoutInfo.timeoutPlayerRet
                  })

                  // Compute remaining time
                  self.state.timeoutStarter.methods.getTimeoutThreshold().call().then(function(timeoutThreshold) {

                      var currentTimestamp = new Date().getTime() / 1000
                      var endTimestamp = parseInt(timeoutThreshold) + parseInt(timeoutInfo.timeoutTimestampRet)
                      var remaining = endTimestamp - currentTimestamp

                      if (remaining<0) {
                        remaining = 0
                      }
                      self.setState({remainingTime: Math.floor(remaining)})
                      setTimeout(self.updateRemainingTime, 1000)
                  })
                })
              }
              else {
                self.setState({timeoutBlamed: -1})
              }
            })


          })
        }
        else {
          self.setState({running: false})
        }
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

    if (self.state.timeoutStarter != null && self.state.timeoutStopper != null) {
      var lastStates = SW.getLastStates()

      // Fill last state data
      var i = 0

      if(this.props.turn > 0 || (this.props.turn == 0 && this.props.turnPlayer > 0)) {
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
          tmp.push('0x50402d24bf1f5de1cd884e55bf6cc9146f871c1c36e731e17a17d34e1ca58723')
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
      // If first turn therefore the first element of lastStates will not contains metadata
      if(!('metadata' in lastStates[0])) {
        metadata[0][0] = self.state.matchId.toString()
      }

      self.state.timeoutStarter.methods.startTimeout(metadata, move, moveOutput, signatureRS, v, originState, nbSignature).send({
        from: self.state.account.address,
        gasPrice: 2000000000,
        gas: '2000000'
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

    if (self.state.timeoutStarter != null && self.state.timeoutStopper != null) {
      SW.getTimeoutState(self.state.matchId, self.state.timeoutTurn, self.state.timeoutPlayerTurn, function(timeoutState) {

        if(timeoutState != null) {

          // Parameters
          var metadataAndMove = []
          var moveOutput = []
          var signatureRS = []
          var v = []
          var nbSignature = timeoutState.state.length


          // Fill last state data
          var i = 0
          while(i < timeoutState.state.length) {

            metadataAndMove.push(timeoutState.state[i].metadata.concat(timeoutState.state[i].move))
            moveOutput.push(timeoutState.state[i].moveOutput)

            var rHex = timeoutState.state[i].signature.slice(0, 66)
            var sHex = '0x' + timeoutState.state[i].signature.slice(66, 130)
            signatureRS.push([rHex, sHex])
            var splittedSig = ethjs.fromRpcSig(timeoutState.state[i].signature)
            v.push(splittedSig.v)

            i++
          }

          // Fill the remaining parameters with junk data
          for(; i<8; i++) {
            var tmp = []
            for(var j=0; j<7; j++) {
              tmp.push('0')
            }
            metadataAndMove.push(tmp)
            tmp = []
            for(j=0; j<176; j++) {
              tmp.push('0')
            }
            moveOutput.push(tmp)
            tmp = []
            for(j=0; j<2; j++) {
              tmp.push('0x50402d24bf1f5de1cd884e55bf6cc9146f871c1c36e731e17a17d34e1ca58723')
            }
            signatureRS.push(tmp)
            v.push('0')
          }

          // originState at the end of moveOutput
          moveOutput.push(timeoutState.originState)

          self.state.timeoutStopper.methods.stopTimeout(metadataAndMove, moveOutput, signatureRS, v, nbSignature).send({
            from: self.state.account.address,
            gasPrice: 2000000000,
            gas: '1000000'
          })
          .on('error', function(error){ console.log('ERROR: ' + error)})
          .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
          .on('receipt', function(receipt){ console.log('receipt')})
          .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
          .then(function(ret) {
            alert('Time out stopped')
          })

        }
      })
    }
  }

  confirmTimeout(e) {
    e.preventDefault()
    var self = this

    if(self.state.timeoutStarter != null && self.state.timeoutStopper != null) {
      self.state.timeoutStopper.methods.confirmTimeout(self.state.matchId).send({
        from: self.state.account.address,
        gasPrice: 2000000000,
        gas: '1000000'
      })
      .on('error', function(error){ console.log('ERROR: ' + error)})
      .on('transactionHash', function(transactionHash){ console.log('transactionHash: ' + transactionHash)})
      .on('receipt', function(receipt){ console.log('receipt')})
      .on('confirmation', function(confirmationNumber, receipt){ console.log('confirmation')})
      .then(function(ret) {
        alert('Time out confirmed')
      })
    }
  }

  updateRemainingTime() {
    if(this.state.remainingTime > 0) {
      var remaining = this.state.remainingTime
      remaining -= 1
      if (remaining<0) {
        remaining = 0
      }
      this.setState({remainingTime: Math.floor(remaining)})
      setTimeout(this.updateRemainingTime, 1000)
    }
  }


  render() {
    var content = null

    // BUG: using getCurrentTurn gave us an error, we use props instead
    var actualTurn = [this.props.turn,this.props.turnPlayer] //SW.getCurrentTurn(this.state.playerMax)

    if(this.state.running == true) {

      if(this.state.timeoutBlamed == -1) {
        // No timeout process is currently pending

        // If it is not our turn, we display button to start timeout
        if(actualTurn[1] != this.state.playerIndex) {
          content =
            <div style={{textAlign: 'center'}}>
              <button style={{marginTop: '20px', marginBottom: '10px'}} onClick={this.startTimeout} className="buttonTimeout">Start timeout</button>
            </div>
        }
      }
      else {
        if(this.state.timeoutBlamed == this.state.playerIndex) {
          // If we are the blamed player

          // Check if the turn has been played
          if(actualTurn[0] > this.state.timeoutTurn || (actualTurn[0] == this.state.timeoutTurn && actualTurn[1] > this.state.timeoutPlayerTurn)) {
            // Turn has been played
            content =
              <div style={{textAlign: 'center'}}>
                <h3>Time out process has been launched</h3>
                <button style={{marginTop: '20px', marginBottom: '10px'}} onClick={this.stopTimeout} className="buttonTimeout">Stop time out process</button>
              </div>
          }
          else
          {
            // Turn has not been played
            if(this.state.remainingTime > 0) {
              content =
                <div style={{textAlign: 'center'}}>
                  <h3>Time out process launched</h3>
                  <h3>You have {this.state.remainingTime} seconds</h3>
                  <h3>to play</h3>
                </div>
            }
            else {
              content =
                <div style={{textAlign: 'center'}}>
                  <h3>Time out</h3>
                </div>
            }
          }
        }
        else {
          // We are not the blamed player
          if(this.state.remainingTime > 0) {
            content =
              <div style={{textAlign: 'center'}}>
                <h3>Time out in process</h3>
                <h3>Time left:</h3>
                <h3>{this.state.remainingTime} seconds...</h3>
              </div>
          }
          else {
            content =
              <div style={{textAlign: 'center'}}>
                <h3>Time out</h3>
                <button style={{marginTop: '20px', marginBottom: '10px'}} onClick={this.confirmTimeout} className="buttonTimeout">Kick the player</button>
              </div>
          }
        }
      }
    }

    return (content)
  }
}

export default TimeoutInterface
