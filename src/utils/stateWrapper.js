var request = require('request')

import store from '../store'


exports.updateServer = function(id) {
  // Get the current state
  request.post(
    'http://localhost:3000/post/currentstate',
    { json: { matchId: id } },
    function (stateError, stateResponse, stateBody) {
      if (!stateError && stateResponse.statusCode == 200) {

        // Get the metadata of the state
        request.post(
          'http://localhost:3000/post/currentmetadata',
          { json: { matchId: id } },
          function (metadataError, metadataResponse, metadataBody) {
            if (!metadataError && metadataResponse.statusCode == 200) {
              // Update stored state and metadata
              store.dispatch({type: 'STATE_UPDATED', payload:
                {
                  currentStateInstance: stateBody,
                  currentStateMatch: id,
                  currentStateTurn: metadataBody[0],
                  currentStatePlayerTurn: metadataBody[1],
                }
              })
            }
          }
        )
      }
      else {
        console.log(stateError)
      }
    }
  )
}

exports.pushSignature = function(serverId, metadata, move, moveOutput) {

  self.state.web3.eth.personal.sign(self.state.web3.utils.soliditySha3(
    {t: 'uint[]', v: metadata},
    {t: 'uint8[]', v: move},
    {t: 'uint[]', v: moveOutput},
  ), self.state.account.address).then(function(sig) {

    // Send request
    request.post(
      'http://localhost:3000/post/pushsignature',
      { json:
        {
          matchId: serverId,
          metadata: metadata,
          move: move,
          moveOutput: moveOutput,
          signature: sig
        }
      },
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(body)
        }
        else {
          console.log(error)
        }
      }
    )
  })
}


// Utils
// Inspired from stateManager contract

exports.getCurrentMatch = function() {
  return store.getState().currentState.currentStateMatch
}

exports.getCurrentTurn = function(nbPlayer) {
  var lastTurn = store.getState().currentState.currentStateTurn
  var lastPlayerTurn = store.getState().currentState.currentStatePlayerTurn
  var lastState = store.getState().currentState.currentStateInstance[store.getState().currentState.currentStateInstance.length-1].moveOutput

  // Increment player turn till alive player
  do {
    lastPlayerTurn++
    if (lastPlayerTurn >= nbPlayer) {
      lastPlayerTurn = 0
      lastTurn++
    }
  } while (lastState[128+lastPlayerTurn] == 0)

  return [lastTurn, lastPlayerTurn]
}

exports.getCurrentState = function() {
  var lastState = store.getState().currentState.currentStateInstance[store.getState().currentState.currentStateInstance.length-1].moveOutput
  return lastState
}

exports.getBuilding = function(x, y) {
  var lastState = store.getState().currentState.currentStateInstance[store.getState().currentState.currentStateInstance.length-1].moveOutput
  return lastState[x*8+y]
}

exports.getPlayerPosition = function(p) {
  var lastState = store.getState().currentState.currentStateInstance[store.getState().currentState.currentStateInstance.length-1].moveOutput
  return (lastState[136+p], lastState[144+p])
}

exports.getPlayerHealth = function(p) {
  var lastState = store.getState().currentState.currentStateInstance[store.getState().currentState.currentStateInstance.length-1].moveOutput
  return lastState[128+p]
}

exports.getPlayerWeapons = function(p) {
  var lastState = store.getState().currentState.currentStateInstance[store.getState().currentState.currentStateInstance.length-1].moveOutput
  if(lastState[152+p] == 0) {
      return []
  }
  else if(lastState[160+p] == 0) {
      return [lastState[152+p]]
  }
  else if(lastState[168+p] == 0) {
      return [lastState[152+p], lastState[160+p]]
  }
  else {
      return [lastState[152+p], lastState[160+p], lastState[168+p]]
  }
}
