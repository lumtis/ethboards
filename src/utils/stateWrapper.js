var request = require('request')

import store from '../store'


// TODO:
// gérer mieux les erreurs

exports.updateServer = function(id) {

  // Get the metadata of the state
  request.post(
    'http://localhost:3000/post/currentmetadata',
    { json: { matchId: id } },
    function (metadataError, metadataResponse, metadataBody) {
      if (!metadataError && metadataResponse.statusCode == 200) {

        if(metadataBody[1] == -1) {
          // If playerturn == -1 the match has not started yet, we get the initial state
          var serverManager = store.getState().web3.serverManagerInstance
          if(serverManager != null) {
            serverManager.methods.getMatchServer(id).call().then(function(serverId) {
              serverManager.methods.getInitialState(serverId).call({gas: '1000000'}).then(function(initialState) {
                var initialStateFormatted = [{
                  moveOutput: initialState
                }]

                store.dispatch({type: 'STATE_UPDATED', payload:
                  {
                    currentStateInstance: initialStateFormatted,
                    currentStateMatch: id,
                    currentStateTurn: metadataBody[0],
                    currentStatePlayerTurn: metadataBody[1],
                  }
                })
              })
            })
          }
        }
        else {
          // The match started, we can get the state from redis
          request.post(
            'http://localhost:3000/post/currentstate',
            { json: { matchId: id } },
            function (stateError, stateResponse, stateBody) {
              if (!stateError && stateResponse.statusCode == 200) {
                // Update stored state and metadata

                store.dispatch({type: 'STATE_UPDATED', payload:
                  {
                    currentStateInstance: stateBody.state,
                    currentStateMatch: id,
                    currentStateTurn: metadataBody[0],
                    currentStatePlayerTurn: metadataBody[1],
                    originState: stateBody.originState
                  }
                })
              }
              else {
                console.log(stateError)
              }
            }
          )
        }
      }
    }
  )
}

exports.pushSignature = function(id, metadata, move, moveOutput) {

  var web3 = store.getState().web3.web3Instance
  var account = store.getState().account.accountInstance

  if(web3 != null && account != null) {

    // Signing message
    web3.eth.personal.sign(web3.utils.soliditySha3(
      {t: 'uint[]', v: metadata},
      {t: 'uint[]', v: move},
      {t: 'uint[]', v: moveOutput},
    ), account.address).then(function(sig) {
      // Send signature to server
      request.post(
        'http://localhost:3000/post/pushsignature',
        { json:
          {
            matchId: id,
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
  else {
    console.log('web3 or account not initialized')
  }
}

// Get state to stop timeout
exports.getTimeoutState = function(id, timeoutTurn, timeoutPlayerTurn, cb) {
  // Request the state to be able to stop timeout

  // Get the turn to begin with
  // TODO: add gas to 100000
  var timeoutStarter = store.getState().web3.timeoutStarterInstance
  if(timeoutStarter != null) {

    timeoutStarter.methods.getLastMoves(id).call().then(function(lastMoves) {

      // Check if it is the first turn
      if(lastMoves.nbRet == 0) {
        // Get timeout informations to fill necessary parameters
        request.post(
          'http://localhost:3000/post/specificstate',
          { json:
            {
              matchId: id,
              turnBegin: 0,
              playerBegin: 0,
              turnEnd: timeoutTurn,
              playerEnd: timeoutPlayerTurn
            }
          },
          function (error, response, body) {
            if (!error && response.statusCode == 200) {
              // Call callback with response
              cb(body)
            }
            else {
              console.log(error)
            }
          }
        )
      }
      else {
        timeoutStarter.methods.getLastMovesMetadata(id).call().then(function(lastMetadatas) {
          // Get timeout informations to fill necessary parameters

          request.post(
            'http://localhost:3000/post/specificstate',
            { json:
              {
                matchId: id,
                turnBegin: lastMetadatas.turnRet[0],
                playerBegin: lastMetadatas.playerRet[0],
                turnEnd: timeoutTurn,
                playerEnd: timeoutPlayerTurn
              }
            },
            function (error, response, body) {
              if (!error && response.statusCode == 200) {
                // Call callback with response
                cb(body)
              }
              else {
                console.log(error)
              }
            }
          )
        })
      }
    })
  }
}


// Utils
// Inspired from stateManager contract

exports.getCurrentMatch = function() {
  return parseInt(store.getState().currentState.currentStateMatch)
}

exports.getCurrentTurn = function(nbPlayer) {
  var lastTurn = parseInt(store.getState().currentState.currentStateTurn)
  var lastPlayerTurn = parseInt(store.getState().currentState.currentStatePlayerTurn)
  var lastState = store.getState().currentState.currentStateInstance[store.getState().currentState.currentStateInstance.length-1].moveOutput.map(x => parseInt(x))

  // State channel has not been initialized yet
  if (lastPlayerTurn == -1) {
    return [0, 0]
  }

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
  var currentState = store.getState().currentState.currentStateInstance
  if(currentState == null) {
    return null
  }

  var lastState = currentState[currentState.length-1].moveOutput
  return lastState.map(x => parseInt(x))
}

exports.getLastStates = function() {
  var currentState = store.getState().currentState.currentStateInstance
  return currentState
}

exports.getOriginState = function() {
  var originState = store.getState().currentState.originState
  return originState
}

exports.getBuilding = function(x, y) {
  var currentState = store.getState().currentState.currentStateInstance
  if(currentState == null) {
    return 0
  }

  var lastState = currentState[currentState.length-1].moveOutput
  return lastState[parseInt(x)*8+parseInt(y)]
}

exports.getPlayerPosition = function(p) {
  var currentState = store.getState().currentState.currentStateInstance
  if(currentState == null) {
    return [0,0]
  }

  var lastState = currentState[currentState.length-1].moveOutput
  return [lastState[136+parseInt(p)], lastState[144+parseInt(p)]]
}

exports.getPlayerHealth = function(p) {
  var currentState = store.getState().currentState.currentStateInstance
  if(currentState == null) {
    return 0
  }

  var lastState = currentState[currentState.length-1].moveOutput
  return lastState[128+parseInt(p)]
}

exports.getPlayerWeapons = function(p) {
  var currentState = store.getState().currentState.currentStateInstance
  if(currentState == null) {
    return []
  }

  var lastState = currentState[currentState.length-1].moveOutput

  if(parseInt(lastState[152+parseInt(p)]) == 0) {
      return []
  }
  else if(parseInt(lastState[160+parseInt(p)]) == 0) {
      return [parseInt(lastState[152+parseInt(p)])-1]
  }
  else if(parseInt(lastState[168+parseInt(p)]) == 0) {
      return [parseInt(lastState[152+parseInt(p)])-1, parseInt(lastState[160+parseInt(p)])-1]
  }
  else {
      return [parseInt(lastState[152+parseInt(p)])-1, parseInt(lastState[160+parseInt(p)])-1, parseInt(lastState[168+parseInt(p)])-1]
  }
}
