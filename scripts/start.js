process.env.NODE_ENV = 'development';

require('dotenv').config({silent: true});

var chalk = require('chalk');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var historyApiFallback = require('connect-history-api-fallback');
var httpProxyMiddleware = require('http-proxy-middleware');
var detect = require('detect-port');
var clearConsole = require('react-dev-utils/clearConsole');
var checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
var formatWebpackMessages = require('react-dev-utils/formatWebpackMessages');
var getProcessForPort = require('react-dev-utils/getProcessForPort');
var openBrowser = require('react-dev-utils/openBrowser');
var prompt = require('react-dev-utils/prompt');
var pathExists = require('path-exists');
var config = require('../config/webpack.config.dev');
var paths = require('../config/paths');

var useYarn = pathExists.sync(paths.yarnLockFile);
var cli = useYarn ? 'yarn' : 'npm';
var isInteractive = process.stdout.isTTY;


////////////////////////////////////////////////////////////////////
// Start necessary services

var Web3 = require('web3')
var RedisClient = require('redis')

var redis = RedisClient.createClient(6379, '127.0.0.1')
var provider = new Web3.providers.HttpProvider('http://localhost:8545')
var web3 = new Web3(provider)

var ethjs = require('ethereumjs-util')

// Creating contract
var nujaBattleJson = require('../build/contracts/NujaBattle.json')
var nujaBattleAddress = '0x9f8C0484e696a86b049259583a31dE467Fd53966'
var nujaBattle = new web3.eth.Contract(nujaBattleJson.abi, nujaBattleAddress)

var serverManagerJson = require('../build/contracts/ServerManager.json')
var serverManagerAddress = '0xD47Dc3Ab397b949C8e544076958c911eb3c6aab4'
var serverManager = new web3.eth.Contract(serverManagerJson.abi, serverManagerAddress)

var timeoutStarterJson = require('../build/contracts/TimeoutStarter.json')
var timeoutStarterAddress = '0xD47Dc3Ab397b949C8e544076958c911eb3c6aab4'
var timeoutStarter = new web3.eth.Contract(timeoutStarterJson.abi, timeoutStarterAddress)


const turnPrefix = '_playerturn213'
const playerTurnPrefix = '_playerturn213'
const statePrefix = '_state213'
const killedPlayerPrefix = '_killedplayers213'
const nbTimeoutPrefix = '_nbtimeout213'


redis.on("connect", function () {
  console.log("connected to redis")
})


function getCurrentTurn(matchId, nbPlayer, cb) {

  // We first check if the key exists
  redis.exists(matchId + turnPrefix, function (existsErr, existsReply){
    if(existsReply == 0) {
      // If the key doesn't exist we can return 0
      // pushsignature function will determine if the match exist
      cb([0, 0])
    }
    else {
      // If the key exist, get next turn
      redis.llen(matchId + statePrefix, function (llenErr, llenReply) {
        redis.lrange(matchId + statePrefix, -1, llenReply, function (stateErr, stateReply) {
          redis.get(matchId + turnPrefix, function (turnErr, turnReply) {
            redis.get(matchId + playerTurnPrefix, function (playerTurnErr, playerTurnReply) {
              if(stateErr == null && turnErr == null && playerTurnErr == null) {

                var lastTurn = turnReply
                var lastPlayerTurn = playerTurnReply
                var lastState = JSON.parse(stateReply[0]).moveOutput

                // Increment player turn till alive player
                do {
                  lastPlayerTurn++
                  if (lastPlayerTurn >= nbPlayer) {
                    lastPlayerTurn = 0
                    lastTurn++
                  }
                } while (lastState[128+lastPlayerTurn] == 0)

                cb([lastTurn, lastPlayerTurn])
              }
            })
          })
        })
      })
    }
  })
}

// Updata states and variables after time out occured
function updateTimeout(matchId, cb) {
  // Verify the nb of timeout is the same as timeout manager contract
  // If not we update turn and player turn
  // Remove eventual additional states
  // And add the state with timeouted player killed

  // Recursive function for all timeout
  function updateTimeoutRecursive(endCallback) {
    var actualNbTimeout = -1

    // We first check if the key exists
    redis.exists(matchId + nbTimeoutPrefix, function (existsErr, existsReply) {
      if(existsReply == 0) {
        // Key does'nt exist, so number of timeout is 0
        actualNbTimeout = 0
      }
      redis.get(matchId + nbTimeoutPrefix, function (nbErr, nbReply) {
        if(actualNbTimeout == -1) {
          actualNbTimeout = nbReply
        }

        // Check if actual number is the same from contract
        timeoutStarter.methods.getTimeoutPlayers(matchId).call().then(function(timeoutPlayers) {

          if(actualNbTimeout >= timeoutPlayers.nbTimeoutRet) {
            endCallback()
          }
          else {
            // Remove all moves ahead the timeout

            // Recursive function to remove all moves ahead the timeout
            function removeMovesAheadTimeout(timeoutTurn, timeoutTurnPlayer, endCallback_) {
              // Get the last state
              redis.llen(matchId + statePrefix, function (llenErr, llenReply) {

                if(llenReply == 0) {
                  // No remaining turn so no turn ahead
                  endCallback_()
                }

                redis.lrange(matchId + statePrefix, -1, llenReply, function (stateErr, stateReply) {
                  // Check with the metadata if the moves is ahead
                  var actualLastTurn = JSON.parse(stateReply[0]).metadata[1]
                  var actualLastTurnPlayer = JSON.parse(stateReply[0]).metadata[2]

                  if(actualLastTurn > timeoutTurn || (actualLastTurn == timeoutTurn && actualLastTurnPlayer >= timeoutTurnPlayer)) {
                    console.log(actualLastTurn)
                    console.log(actualLastTurnPlayer)
                    console.log('removed')
                    redis.rpop(matchId + statePrefix, function (rpopErr, rpopReply) {
                      removeMovesAheadTimeout(timeoutTurn, timeoutTurnPlayer, endCallback_)
                    })
                  }
                  else {
                    // All moves were removed
                    endCallback_()
                  }

                })
              })
            }

            // Call removeMoves callback function
            removeMovesAheadTimeout(timeoutPlayers.timeoutTurnRet[actualNbTimeout], timeoutPlayers.timeoutPlayerRet[actualNbTimeout], function() {
              // All player has been removed
              // We add a new moves in the states list with timed out player killed

              if(timeoutPlayers.timeoutTurnRet[actualNbTimeout] == 0 && timeoutPlayers.timeoutPlayerRet[actualNbTimeout] == 0) {
                // If it is the first turn to be timed out we use initialState
                serverManager.methods.getMatchServer(matchId).call().then(function(serverId) {
                  serverManager.methods.getInitialState(serverId).call({gas: '1000000'}).then(function(initialState) {

                    // Kill the timed out player
                    nujaBattle.methods.kill(initialState, timeoutPlayers.timeoutPlayerRet[actualNbTimeout]).call({gas: '1000000'}).then(function(timedoutState) {
                      var timeoutMetadata = [matchId, timeoutPlayers.timeoutTurnRet[actualNbTimeout], timeoutPlayers.timeoutPlayerRet[actualNbTimeout]]

                      // Fill junk data for move and signature as they are useless for timed out turn
                      var timeoutMove = [0,0,0,0]
                      var timeoutSignature = ''

                      // We push the timed out move
                      redis.rpush(matchId + statePrefix, JSON.stringify({
                        metadata: timeoutMetadata,
                        move: timeoutMove,
                        moveOutput: timedoutState,
                        signature: timeoutSignature,
                      }), function (pushErr, pushReply) {
                        if(pushErr != null) {
                          console.log('redis push signature error :' + pushErr)
                        }
                        else {
                          // Update metadata
                          redis.set(matchId + turnPrefix, timeoutPlayers.timeoutTurnRet[actualNbTimeout], function (turnErr, turnReply){
                            // TODO: gestion erreur
                            redis.set(matchId + playerTurnPrefix, timeoutPlayers.timeoutPlayerRet[actualNbTimeout], function (playerturnErr, playerturnReply){
                              // TODO: gestion erreur

                              redis.set(matchId + nbTimeoutPrefix, actualNbTimeout+1, function (nbtimeoutErr, nbtimeoutReply){
                                // TODO: gestion erreur
                                // Recall the function in case there are other timed ou turns
                                updateTimeoutRecursive(endCallback)
                              })
                            })
                          })
                        }
                      })

                    })

                  })
                })
              }
              else {

                console.log('Adding kill move')

                // If not the first turn we get the last turn
                redis.llen(matchId + statePrefix, function (llenErr, llenReply) {
                  redis.lrange(matchId + statePrefix, -1, llenReply, function (stateErr, stateReply) {
                    var lastMoveOutput = JSON.parse(stateReply[0]).moveOutput

                    // Kill the timed out player
                    nujaBattle.methods.kill(lastMoveOutput, timeoutPlayers.timeoutPlayerRet[actualNbTimeout]).call({gas: '1000000'}).then(function(timedoutState) {
                      var timeoutMetadata = [matchId, timeoutPlayers.timeoutTurnRet[actualNbTimeout], timeoutPlayers.timeoutPlayerRet[actualNbTimeout]]

                      // Fill junk data for move and signature as they are useless for timed out turn
                      var timeoutMove = [0,0,0,0]
                      var timeoutSignature = ''

                      // We push the timed out move
                      redis.rpush(matchId + statePrefix, JSON.stringify({
                        metadata: timeoutMetadata,
                        move: timeoutMove,
                        moveOutput: timedoutState,
                        signature: timeoutSignature,
                      }), function (pushErr, pushReply) {
                        if(pushErr != null) {
                          console.log('redis push signature error :' + pushErr)
                        }
                        else {
                          // Update metadata
                          redis.set(matchId + turnPrefix, timeoutPlayers.timeoutTurnRet[actualNbTimeout], function (turnErr, turnReply){
                            // TODO: gestion erreur
                            redis.set(matchId + playerTurnPrefix, timeoutPlayers.timeoutPlayerRet[actualNbTimeout], function (playerturnErr, playerturnReply){
                              // TODO: gestion erreur

                              redis.set(matchId + nbTimeoutPrefix, actualNbTimeout+1, function (nbtimeoutErr, nbtimeoutReply){
                                // TODO: gestion erreur
                                // Recall the function in case there are other timed ou turns
                                updateTimeoutRecursive(endCallback)
                              })
                            })
                          })
                        }
                      })

                    })

                  })
                })
              }
            })
          }
        })
      })
    })
  }

  // Call recursive function for first time
  updateTimeoutRecursive(cb)
}


// Used when a user has not shared his move and claim timeout
// If a player has been timed out, remove eventual moves that has been played after
function updateLastMoves(matchId, nbPlayer, cb) {

  // Before anything else update the list of state depending of timeout that occured
  updateTimeout(matchId, function() {


    // Check if there are not shared moves
    timeoutStarter.methods.isTimeout(matchId).call().then(function(isTimeout) {
      if(isTimeout) {
        timeoutStarter.methods.timeoutInfos(matchId).call().then(function(timeoutInfo) {
          getCurrentTurn(matchId, nbPlayer, function(actualTurn) {

            if(timeoutInfo.timeoutTurnRet > actualTurn[0] || (timeoutInfo.timeoutTurnRet == actualTurn[0] && timeoutInfo.timeoutPlayerRet > actualTurn[1])) {

              timeoutStarter.methods.getLastMovesMetadata(matchId).call().then(function(lastMovesMetadata) {
                timeoutStarter.methods.getLastMoves(matchId).call().then(function(lastMoves) {
                  timeoutStarter.methods.getLastMovesSignature(matchId).call().then(function(lastMovesSignature) {
                    // We get the last state to check missing moves
                    redis.llen(matchId + statePrefix, function (llenErr, llenReply) {
                      redis.lrange(matchId + statePrefix, -1, llenReply, function (stateErr, stateReply) {
                        var lastState = JSON.parse(stateReply[0])

                        // Search where missing moves start
                        var i = 0
                        while(lastState.metadata[1] > parseInt(lastMovesMetadata.turnRet[i]) || (lastState.metadata[1] == parseInt(lastMovesMetadata.turnRet[i]) && lastState.metadata[2] >= parseInt(lastMovesMetadata.playerRet[i]))) {
                            i += 1
                        }

                        // Push the missing signature
                        serverManager.methods.getMatchServer(matchId).call().then(function(serverId) {
                          var lastMoveOutput = lastState.moveOutput

                          // Define recursive function to push all missing moves
                          function simulateAndPush(n, endCallback) {

                            if(n >= lastMoves.nbRet) {

                              // We pushed all missing moves, we update metadata and terminate
                              // Metadata is last missing move metadata
                              redis.set(matchId + turnPrefix, parseInt(lastMovesMetadata.playerRet[lastMoves.nbRet-1]), function (turnErr, turnReply){
                                // TODO: gestion erreur
                                redis.set(matchId + playerTurnPrefix, parseInt(lastMovesMetadata.playerRet[lastMoves.nbRet-1]), function (playerturnErr, playerturnReply){
                                  // TODO: gestion erreur
                                  endCallback()
                                })
                              })

                            }
                            else {
                              // Simulate the missing move to get the missing moveOutput
                              nujaBattle.methods.simulate(serverId, parseInt(lastMovesMetadata.playerRet[i]), lastMoves.moveRet[n][0], lastMoves.moveRet[n][1], lastMoves.moveRet[n][2], lastMoves.moveRet[n][3], lastMoveOutput).call({gas: '1000000'}).then(function(simulatedOutput){

                                lastMoveOutput = simulatedOutput

                                // Get the signature from r s and v values
                                lastSignature = ethjs.toRpcSig(
                                  lastMovesSignature.lastVRet[n],
                                  ethjs.toBuffer(lastMovesSignature.lastRRet[n]),
                                  ethjs.toBuffer(lastMovesSignature.lastSRet[n])
                                )

                                // Push the missing move
                                redis.rpush(matchId + statePrefix, JSON.stringify({
                                  metadata: [matchId, parseInt(lastMovesMetadata.turnRet[i]), parseInt(lastMovesMetadata.playerRet[i])],
                                  move: lastMoves.moveRet[n],
                                  moveOutput: simulatedOutput,
                                  signature: lastSignature,
                                }), function (pushErr, pushReply) {
                                  if(pushErr != null) {
                                    // Recursion
                                    simulateAndPush(n+1, endCallback)
                                  }
                                  else {
                                    // Unexcepted error occured, we directly call end function for safety
                                    endCallback()
                                  }
                                })
                              })
                            }
                          }
                          // Call the recursive fucntion
                          simulateAndPush(i, cb)

                        })
                      })
                    })
                  })
                })
              })
            }
            else {
              // No missing last move
              cb()
            }
          })
        })
      }
      else {
        // No time out
        cb()
      }
    })
  })
}

// Get list of killed player in a turn
function getKilledPlayers(moveInput, moveOutput) {
  var killed = []

  // WARNING: String ?
  for(var i=0; i<8; i++){
    if(moveInput[128+i] > 0 && moveOutput[128+i] == 0){
      killed.push(i)
    }
  }
  return killed
}

function pushKilledPlayer(matchId, killer, killed, turn) {

  // Get list of signature to prove the kill
  redis.llen(matchId + statePrefix, function (llenErr, llenReply) {
    redis.lrange(matchId + statePrefix, -9, llenReply, function (stateErr, stateReply) {

      // killPlayer function needs the origin state the the signature list
      // To get it we get the 9 last signatures, the origin state is the first one
      // We update it if we need to remove signature
      var originState = JSON.parse(stateReply[0]).moveOutput


      // Remove useless signature
      for(var i=0; i<9; i++) {
        if(JSON.parse(stateReply[0]).metadata[1] < turn-1 || (JSON.parse(stateReply[0]).metadata[1] == turn-1 && JSON.parse(stateReply[0]).metadata[2] <= killer)) {
          originState = JSON.parse(stateReply[0]).moveOutput
          stateReply.shift()
        }
        else {
          break
        }
      }

      //Push the signatures to the players to kill list
      redis.rpush(matchId + killedPlayerPrefix, JSON.stringify({
        signaturesList: stateReply,
        killer: killer,
        killed: killed,
        originState: originState
      }), function (pushErr, pushReply) {
        if(pushErr != null) {
          console.log('redis push player to kill error :' + pushErr)
        }
        else {
          console.log('signatures pushed')
        }
      })

    })
  })
}

////////////////////////////////////////////////////////////////////



// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// Tools like Cloud9 rely on this.
var DEFAULT_PORT = process.env.PORT || 3000;
var compiler;
var handleCompile;

// You can safely remove this after ejecting.
// We only use this block for testing of Create React App itself:
var isSmokeTest = process.argv.some(arg => arg.indexOf('--smoke-test') > -1);
if (isSmokeTest) {
  handleCompile = function (err, stats) {
    if (err || stats.hasErrors() || stats.hasWarnings()) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  };
}

function setupCompiler(host, port, protocol) {
  // "Compiler" is a low-level interface to Webpack.
  // It lets us listen to some events and provide our own custom messages.
  compiler = webpack(config, handleCompile);

  // "invalid" event fires when you have changed a file, and Webpack is
  // recompiling a bundle. WebpackDevServer takes care to pause serving the
  // bundle, so if you refresh, it'll wait instead of serving the old one.
  // "invalid" is short for "bundle invalidated", it doesn't imply any errors.
  compiler.plugin('invalid', function() {
    if (isInteractive) {
      clearConsole();
    }
    console.log('Compiling...');
  });

  var isFirstCompile = true;

  // "done" event fires when Webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.plugin('done', function(stats) {
    if (isInteractive) {
      clearConsole();
    }

    // We have switched off the default Webpack output in WebpackDevServer
    // options so we are going to "massage" the warnings and errors and present
    // them in a readable focused way.
    var messages = formatWebpackMessages(stats.toJson({}, true));
    var isSuccessful = !messages.errors.length && !messages.warnings.length;
    var showInstructions = isSuccessful && (isInteractive || isFirstCompile);

    if (isSuccessful) {
      console.log(chalk.green('Compiled successfully!'));
    }

    if (showInstructions) {
      console.log();
      console.log('The app is running at:');
      console.log();
      console.log('  ' + chalk.cyan(protocol + '://' + host + ':' + port + '/'));
      console.log();
      console.log('Note that the development build is not optimized.');
      console.log('To create a production build, use ' + chalk.cyan(cli + ' run build') + '.');
      console.log();
      isFirstCompile = false;
    }

    // If errors exist, only show errors.
    if (messages.errors.length) {
      console.log(chalk.red('Failed to compile.'));
      console.log();
      messages.errors.forEach(message => {
        console.log(message);
        console.log();
      });
      return;
    }

    // Show warnings if no errors were found.
    if (messages.warnings.length) {
      console.log(chalk.yellow('Compiled with warnings.'));
      console.log();
      messages.warnings.forEach(message => {
        console.log(message);
        console.log();
      });
      // Teach some ESLint tricks.
      console.log('You may use special comments to disable some warnings.');
      console.log('Use ' + chalk.yellow('// eslint-disable-next-line') + ' to ignore the next line.');
      console.log('Use ' + chalk.yellow('/* eslint-disable */') + ' to ignore all warnings in a file.');
    }
  });
}

// We need to provide a custom onError function for httpProxyMiddleware.
// It allows us to log custom error messages on the console.
function onProxyError(proxy) {
  return function(err, req, res){
    var host = req.headers && req.headers.host;
    console.log(
      chalk.red('Proxy error:') + ' Could not proxy request ' + chalk.cyan(req.url) +
      ' from ' + chalk.cyan(host) + ' to ' + chalk.cyan(proxy) + '.'
    );
    console.log(
      'See https://nodejs.org/api/errors.html#errors_common_system_errors for more information (' +
      chalk.cyan(err.code) + ').'
    );
    console.log();

    // And immediately send the proper error response to the client.
    // Otherwise, the request will eventually timeout with ERR_EMPTY_RESPONSE on the client side.
    if (res.writeHead && !res.headersSent) {
        res.writeHead(500);
    }
    res.end('Proxy error: Could not proxy request ' + req.url + ' from ' +
      host + ' to ' + proxy + ' (' + err.code + ').'
    );
  }
}

function addMiddleware(devServer) {
  // `proxy` lets you to specify a fallback server during development.
  // Every unrecognized request will be forwarded to it.
  var proxy = require(paths.appPackageJson).proxy;
  devServer.use(historyApiFallback({
    disableDotRule: true,
    htmlAcceptHeaders: proxy ?
      ['text/html'] :
      ['text/html', '*/*']
  }));
  if (proxy) {
    if (typeof proxy !== 'string') {
      console.log(chalk.red('When specified, "proxy" in package.json must be a string.'));
      console.log(chalk.red('Instead, the type of "proxy" was "' + typeof proxy + '".'));
      console.log(chalk.red('Either remove "proxy" from package.json, or make it a string.'));
      process.exit(1);
    }

    var mayProxy = /^(?!\/(index\.html$|.*\.hot-update\.json$|sockjs-node\/)).*$/;

    // Pass the scope regex both to Express and to the middleware for proxying
    // of both HTTP and WebSockets to work without false positives.
    var hpm = httpProxyMiddleware(pathname => mayProxy.test(pathname), {
      target: proxy,
      logLevel: 'silent',
      onProxyReq: function(proxyReq, req, res) {
        // Browers may send Origin headers even with same-origin
        // requests. To prevent CORS issues, we have to change
        // the Origin to match the target URL.
        if (proxyReq.getHeader('origin')) {
          proxyReq.setHeader('origin', proxy);
        }
      },
      onError: onProxyError(proxy),
      secure: false,
      changeOrigin: true,
      ws: true
    });
    devServer.use(mayProxy, hpm);

    // Listen for the websocket 'upgrade' event and upgrade the connection.
    // If this is not done, httpProxyMiddleware will not try to upgrade until
    // an initial plain HTTP request is made.
    devServer.listeningApp.on('upgrade', hpm.upgrade);
  }

  // Finally, by now we have certainly resolved the URL.
  // It may be /index.html, so let the dev server try serving it again.
  devServer.use(devServer.middleware);
}

function runDevServer(host, port, protocol) {
  var devServer = new WebpackDevServer(compiler, {
    compress: true,
    clientLogLevel: 'none',
    contentBase: paths.appPublic,
    hot: true,
    publicPath: config.output.publicPath,
    quiet: true,
    watchOptions: {
      ignored: /node_modules/
    },
    https: protocol === "https",
    host: host,

    ////////////////////////////////////////////////////////////////////
    //  Handle request for states and signatures pushing

    setup(app){
      var bodyParser = require('body-parser');
      app.use(bodyParser.json());


      // Get the a state given the turn beginning
      app.post("/post/specificstate", bodyParser.json(), function(req, res){
        // req.body.matchId
        // req.body.turnBegin
        // req.body.playerBegin
        // req.body.turnEnd
        // req.body.playerEnd
        // We first check if the key exists
        redis.exists(req.body.matchId + turnPrefix, function (existsErr, existsReply){
          if(existsReply == 0) {
            // If the key doesn't exist, no data
            res.send(null)
          }
          else {

            // Get list of signature to prove the kill
            redis.llen(req.body.matchId + statePrefix, function (llenErr, llenReply) {

              // Get all states
              redis.lrange(req.body.matchId + statePrefix, 0, llenReply, function (stateErr, stateReply) {
                // Search where states list start

                var badInput = false
                var i = 0
                while(JSON.parse(stateReply[i]).metadata[1] != req.body.turnBegin || JSON.parse(stateReply[i]).metadata[2] != req.body.playerBegin) {
                  i++
                  if(i >= llenReply) {
                    badInput = true
                    break
                  }
                }

                if(!badInput) {
                  // Get the origin state of the states list
                  // It represents the output of the begin move
                  originState = JSON.parse(stateReply[i]).moveOutput

                  // If we are not the first turn, we don't count the first turn
                  if(req.body.turnEnd > 0) {
                    i++
                  }

                  // Get all the states
                  var maxStateNb = i+8
                  var states = []
                  while(JSON.parse(stateReply[i]).metadata[1] < req.body.turnEnd || (JSON.parse(stateReply[i]).metadata[1] == req.body.turnEnd && JSON.parse(stateReply[i]).metadata[2] < req.body.playerEnd)) {
                    states.push(JSON.parse(stateReply[i]))
                    i++
                    if(i >= maxStateNb || i >= llenReply) {
                      badInput = true
                      break
                    }
                  }
                  if(JSON.parse(stateReply[i]).metadata[1] == req.body.turnEnd && JSON.parse(stateReply[i]).metadata[2] == req.body.playerEnd) {
                    states.push(JSON.parse(stateReply[i]))
                  }

                  if(!badInput) {
                    // Send response
                    var response = {}
                    response.state = states
                    response.originState = originState

                    res.send(response)
                  }
                  else {
                    res.send(null)
                  }
                }
                else {
                  res.send(null)
                }
              })
            })
          }
        })
      })


      // Get the current state of a match
      app.post("/post/currentstate", bodyParser.json(), function(req, res){

        // We first check if the key exists
        redis.exists(req.body.matchId + turnPrefix, function (existsErr, existsReply){
          if(existsReply == 0) {
            // If the key doesn't exist, no data
            res.send(null)
          }
          else {
            // Get list of signature to prove the kill
            redis.llen(req.body.matchId + statePrefix, function (llenErr, llenReply) {
              redis.lrange(req.body.matchId + statePrefix, -9, llenReply, function (stateErr, stateReply) {

                // killPlayer function needs the origin state the the signature list
                // To get it we get the 9 last signatures, the origin state is the first one
                // We update it if we need to remove signature
                var originState = JSON.parse(stateReply[0]).moveOutput

                // Remove useless signature
                if(stateReply.length >= 8) {
                  for(var i=0; i<9; i++) {
                    // Verify if the first signer is not redundant
                    if(JSON.parse(stateReply[0]).metadata[1] < JSON.parse(stateReply[stateReply.length-1]).metadata[1]-1 || (JSON.parse(stateReply[0]).metadata[1]-1 == JSON.parse(stateReply[stateReply.length-1]).metadata[1] && JSON.parse(stateReply[0]).metadata[2] <= JSON.parse(stateReply[stateReply.length-1]).metadata[2])) {
                      originState = JSON.parse(stateReply[0]).moveOutput
                      stateReply.shift()
                    }
                    else {
                      break
                    }
                  }
                }

                var response = {}
                response.state = stateReply.map(x => JSON.parse(x))
                response.originState = originState

                res.send(response)
              })
            })
          }
        })
      })

      // Get the current metadata (turn, player's turn) of a match
      app.post("/post/currentmetadata", bodyParser.json(), function(req, res){

        // We first check if the key exists
        redis.exists(req.body.matchId + turnPrefix, function (existsErr, existsReply){
          if(existsReply == 0) {
            // If the key doesn't exist, then the match doesn't exist or has not started yet
            res.send([0, -1])
          }
          else {

            // Before getting the metadata we check if we need to updateLastMoves
            serverManager.methods.getMatchServer(req.body.matchId).call().then(function(serverId) {
              serverManager.methods.getPlayerMax(serverId).call().then(function(playerMax) {
                updateLastMoves(req.body.matchId, playerMax, function () {

                  // The match exist, we get metadata
                  redis.get(req.body.matchId + turnPrefix, function (turnErr, turnReply) {
                    if(turnErr != null) {
                      console.log('redis get turn error :' + turnErr)
                    } else {
                      redis.get(req.body.matchId + playerTurnPrefix, function (playerturnErr, playerturnReply) {
                        if(playerturnErr != null) {
                          console.log('redis get player turn error :' + playerturnErr)
                        } else {
                          res.send([turnReply, playerturnReply])
                        }
                      })
                    }
                  })

                })
              })
            })

          }
        })
      })

      // Get the list of player to kill
      app.post("/post/currentkilledplayers", bodyParser.json(), function(req, res){

        // We first check if the key exists
        redis.exists(req.body.matchId + killedPlayerPrefix, function (existsErr, existsReply){
          if(existsReply == 0) {
            // If the key doesn't exist, no data
            res.send(null)
          }
          else {
            // If key exists, get hte list of signatures
            redis.lrange(req.body.matchId + killedPlayerPrefix, 0, 8, function (err, reply) {
              if(err != null) {
                console.log('redis get killed players error :' + err)
              } else {
                // Convert the string stored to json
                res.send(reply.map(x => JSON.parse(x)))
              }
            })
          }
        })
      })

      // Push a new signature
      app.post("/post/pushsignature", bodyParser.json(), function(req, res){

        // Verify the turn and player turn are correct
        var matchId = parseInt(req.body.metadata[0])
        var turn = parseInt(req.body.metadata[1])
        var playerTurn = parseInt(req.body.metadata[2])


        // Get the message signer
        var msg = ethjs.toBuffer(web3.utils.soliditySha3(
            {t: 'uint[]', v: req.body.metadata},
            {t: 'uint[]', v: req.body.move},
            {t: 'uint[]', v: req.body.moveOutput},
        ))

        var prefix = new Buffer("\x19Ethereum Signed Message:\n")
        var prefixedMsg = ethjs.sha3(
          Buffer.concat([prefix, new Buffer(String(msg.length)), msg])
        )
        var splittedSig = ethjs.fromRpcSig(req.body.signature)
        var pubKey = ethjs.ecrecover(prefixedMsg, splittedSig.v, splittedSig.r, splittedSig.s)
        var addrBuf = ethjs.pubToAddress(pubKey)
        var addr = ethjs.bufferToHex(addrBuf)

        console.log(matchId)
        serverManager.methods.getMatchServer(matchId).call().then(function(serverId) {

          // We check the metadata are correct (it is the actual turn)
          serverManager.methods.getPlayerMax(serverId).call().then(function(playerMax) {

            getCurrentTurn(matchId, playerMax, function(actualTurn) {
              if(actualTurn.length > 0 && actualTurn[0] == turn && actualTurn[1] == playerTurn) {

                // We check if the player is present on the server and it's his turn
                serverManager.methods.isAddressInServer(serverId, addr).call().then(function(isInServer) {
                  if(isInServer) {
                    serverManager.methods.getIndexFromAddress(serverId, addr).call().then(function(indexPlayer) {
                      if(indexPlayer == playerTurn) {

                        // We check that the turn is not cheated by simulating it
                        if(turn == 0 && playerTurn == 0){

                          // First turn, we simulate from initialState
                          serverManager.methods.getInitialState(serverId).call({gas: '1000000'}).then(function(initialState) {
                            nujaBattle.methods.simulate(serverId, playerTurn, req.body.move[0], req.body.move[1], req.body.move[2], req.body.move[3], initialState).call({gas: '1000000'}).then(function(simulatedOutput){
                              // WARNING HAS THEY HAVE THE SAME FORMAT ?
                              // Comparing hashed
                              if(web3.utils.sha3(simulatedOutput.toString()) == web3.utils.sha3(req.body.moveOutput.toString())) {

                                // Push the new signature
                                redis.rpush(req.body.matchId + statePrefix, JSON.stringify({
                                  metadata: req.body.metadata,
                                  move: req.body.move,
                                  moveOutput: req.body.moveOutput,
                                  signature: req.body.signature,
                                }), function (pushErr, pushReply) {
                                  if(pushErr != null) {
                                    console.log('redis push signature error :' + pushErr)
                                  }
                                  else {
                                    // If there are killed players during this turn, we push them
                                    var killed = getKilledPlayers(initialState, req.body.moveOutput)

                                    for(var i=0; i<killed.length; i++){
                                      pushKilledPlayer(matchId, req.body.metadata[2], killed[i], req.body.metadata[1])
                                    }

                                    // Update metadata
                                    redis.set(req.body.matchId + turnPrefix, turn, function (turnErr, turnReply){
                                      // TODO: gestion erreur
                                      redis.set(req.body.matchId + playerTurnPrefix, playerTurn, function (playerturnErr, playerturnReply){
                                        // TODO: gestion erreur
                                        res.send("Signature pushed")
                                      })
                                    })

                                  }
                                })

                              }

                            })
                          })
                        }
                        else {

                          // Not first turn, get last moveOutput
                          redis.llen(matchId + statePrefix, function (llenErr, llenReply) {
                            redis.lrange(matchId + statePrefix, -1, llenReply, function (stateErr, stateReply) {
                              var lastState = JSON.parse(stateReply[0]).moveOutput

                              nujaBattle.methods.simulate(serverId, playerTurn, req.body.move[0], req.body.move[1], req.body.move[2], req.body.move[3], lastState).call({gas: '1000000'}).then(function(simulatedOutput){

                                // Comparing hashed
                                if(web3.utils.sha3(simulatedOutput.toString()) == web3.utils.sha3(req.body.moveOutput.toString())) {

                                  // Push the new signature
                                  redis.rpush(req.body.matchId + statePrefix, JSON.stringify({
                                    metadata: req.body.metadata,
                                    move: req.body.move,
                                    moveOutput: req.body.moveOutput,
                                    signature: req.body.signature,
                                  }), function (pushErr, pushReply) {
                                    if(pushErr != null) {
                                      console.log('redis push signature error :' + pushErr)
                                    }
                                    else {
                                      // If there are killed players during this turn, we push them
                                      killed = getKilledPlayers(lastState, req.body.moveOutput)
                                      for(i=0; i<killed.length; i++){
                                        pushKilledPlayer(matchId, req.body.metadata[2], killed[i], req.body.metadata[1])
                                      }

                                      // Update metadata
                                      redis.set(req.body.matchId + turnPrefix, turn, function (turnErr, turnReply){
                                        // TODO: gestion erreur
                                        redis.set(req.body.matchId + playerTurnPrefix, playerTurn, function (playerturnErr, playerturnReply){
                                          // TODO: gestion erreur
                                          res.send("Signature pushed")
                                        })
                                      })
                                    }
                                  })

                                }

                              })
                            })
                          })
                        }

                      }
                      else {
                        console.log('not signer turn')
                      }
                    })
                  }
                  else {
                    // TODO: meilleur gestion d'erreur
                    console.log('signer not in the server')
                  }
                })
              }
            })
          })
        })

      })

    }
  });

  // Our custom middleware proxies requests to /index.html or a remote API.
  addMiddleware(devServer);

  // Launch WebpackDevServer.
  devServer.listen(port, (err, result) => {
    if (err) {
      return console.log(err);
    }

    if (isInteractive) {
      clearConsole();
    }
    console.log(chalk.cyan('Starting the development server...'));
    console.log();

    if (isInteractive) {
      openBrowser(protocol + '://' + host + ':' + port + '/');
    }
  });
}

function run(port) {
  var protocol = process.env.HTTPS === 'true' ? "https" : "http";
  var host = process.env.HOST || 'localhost';
  setupCompiler(host, port, protocol);
  runDevServer(host, port, protocol);
}

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
detect(DEFAULT_PORT).then(port => {
  if (port === DEFAULT_PORT) {
    run(port);
    return;
  }

  if (isInteractive) {
    clearConsole();
    var existingProcess = getProcessForPort(DEFAULT_PORT);
    var question =
      chalk.yellow('Something is already running on port ' + DEFAULT_PORT + '.' +
        ((existingProcess) ? ' Probably:\n  ' + existingProcess : '')) +
        '\n\nWould you like to run the app on another port instead?';

    prompt(question, true).then(shouldChangePort => {
      if (shouldChangePort) {
        run(port);
      }
    });
  } else {
    console.log(chalk.red('Something is already running on port ' + DEFAULT_PORT + '.'));
  }
});
