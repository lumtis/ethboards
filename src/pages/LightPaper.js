import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import { CodeBlock, ocean } from 'react-code-blocks'

import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

import '../css/oswald.css'
import '../css/open-sans.css'
import '../css/pure-min.css'
import '../App.css'

class LightPaper extends Component {
  render() {
    return (
      <div>
        <Navbar />
        <h1 style={{
            color: '#cccccc',
            borderColor: '#000000',
            fontSize: '50px',
            padding: '50px',
            textAlign: 'center',
            textShadow: '2px 2px #393e46'
        }}>Light Paper (under development)</h1>
        <div className="row" style={{padding: '50px'}}>
            <div className="col-md-2">
            </div>
            <div className="col-md-8">
                <div style={boxStyle}>
                    <h3>Introduction</h3>
                    <p>Ethboards is a smart contract platform to create generic two players boardgames on Ethereum.</p>
                    <p>The smart contracts provided handle the state of the game and ensure the players play honestly their turn and don't cheat.</p>
                    <p>Otherwise, the rules of the games are determined by custom smart contracts that can be written by anyone.</p>
                    <p>The rules that can be created are:</p>
                    <ul>
                        <li>What are the possible actions of the pawn in the game</li>
                        <li>How can we determine a player won a game</li>
                    </ul>
                    <p>Next versions will include:</p>
                    <ul>
                        <li>What is the condition to enter a game</li>
                        <li>What actions happen when a player win or lose a game</li>
                    </ul>
                    <p>The vision of this project is to create an ecosystem where people can create games with creative pawns but also creative rules to participates in the game. For example, two players would must lock tokens or a specific asset to participate and the winner wins the locked assets.</p>
                    <p>Kind of a DeFied boardgame platform!</p>
                    <h3>Smart contract platform</h3>
                    <p>The smart contract platform is composed of two smart contracts:</p>
                    <ul>
                        <li><a href="https://github.com/ltacker/ethboards/blob/master/contracts/EthBoards.sol">EthBoards:</a> Game Logic contract. Provide the generic methods to simulate a turn in a game and methods for a user to claim victory</li>
                        <li><a href="https://github.com/ltacker/ethboards/blob/master/contracts/BoardHandler.sol">BoardHandler:</a> Boards Content contract. Store all the information about the boards. For example: what are the different pawns used for a specific board.</li>
                    </ul>
                </div>
            </div>
        </div>
        <div className="row" style={{padding: '50px'}}>
            <div className="col-md-2">
            </div>
            <div className="col-md-8">
                <img src="/assets/docs/SmartContracts1.png" alt="" style={{
                    display: 'block',
                    width: '100%',
                }}></img>
            </div>
        </div>
        <div className="row" style={{padding: '50px'}}>
            <div className="col-md-2">
            </div>
            <div className="col-md-8">
                <div style={boxStyle}>
                    <h3>Custom smart contracts</h3>
                    <h4>Boards</h4>
                    <p>A board is a template for a game, this template defines what are the available pawns in the game, what are their original positions on the board and what are the conditions for a player to win the game.</p>
                    <p>The different boards, where games can be started on, are stored in the BoardHandler contract. The following structure defines a board:</p>
                    <CodeBlock
                        text={'struct Board\n\
                            address boardContract;\n\
                            address creator;\n\
                            bool deployed;\n\
                            uint8 pawnTypeNumber;\n\
                            uint8 pawnNumber;\n\
                            mapping (uint8 => address) pawnTypeAddress;\n\
                            mapping (uint8 => PawnPosition) pawnPosition;\n\
                            uint gameCount;\n\
                            mapping (uint => Game) games;\n\
                            address waitingPlayer;\n\
                        }'}
                        language={'c'}
                        showLineNumbers={false}
                        theme={ocean}
                        wrapLines
                    />
                </div>
            </div>
        </div>
        <div className="row" style={{padding: '50px'}}>
            <div className="col-md-2">
            </div>
            <div className="col-md-8">
                <div style={boxStyle}>
                <h3>Game</h3>
                <p>A game is a succession of game states. A game state is the representation of the game at a given time, where are placed the remaining pawns in the game. The game state is represented through an array of integers.</p>
                <p>Each of these transitions of game state is performed by a move. A move defines which pawn the player decides to move, which action of the pawn (determined by its smart contract) is selected and what are the coordinates where the action is performed. The move is represented by an array of integers as well.</p>
                <p>Currently, all games are played on an 8x8 boards where the maximum number of pawn is 40.</p>
                <p>The game state is represented through an array of 121 integers:</p>
                <ul>
                    <li>[0] represents the number of pawns present on the board</li>
                    <li>[1:41]: Represent what the type of the pawns in the game. 0 means the pawn has been eliminated.</li>
                    <li>[42:81]: Represent the coordinate x of the pawns in the game</li>
                    <li>[82:121]: Represent the coordinate y of the pawns in the game</li>
                </ul>
                <p>Let's say the board is Chess and the pawn type 2 represents a Black Knight. if gameState[1] == 2, gameState[41] == 5 and gameState[81] == 4, it will mean a Black Knight is currently positioned on coordinates [5,6].</p>
                <p>A move is represented through an array of 4 integers:</p>
                <ul>
                    <li>[0] represents the selected pawn to perform the move</li>
                    <li>[1] represents the selected action of the pawn (a pawn smart contract can define several possible actions)</li>
                    <li>[2] represents the coordinate x to perform the action</li>
                    <li>[3] represents the coordinate y to perform the action</li>
                </ul>
                <p>Let's say we're playing chess and the pawn 0 is a Black Knight. It's blacks' turn. The move [0,0,5,5] will move this Black Knight to the coordinates [5,5] (assuming the current state of the game allows this move, this is the Black Knight's smart contract that must verify this condition).</p>
                <h3>State channels</h3>
                <p>This representation of a game as transitions of states allows us to very easily develop a State Channel solution to play games without paying fees (except when entering and claiming victory). A server will store in a database the list of states, moves performed, and signatures of the moves from the players. These data are shared and used when a player wants to claim victory.</p>
                <p><a href="https://github.com/ltacker/ethboards-statechannels">ethboards-statechannels</a> is an implementation of such a server. It is developed in Go and uses MongoDB to store the State Channels. This server exposes a REST API to the players.</p>
                </div>
            </div>
        </div>
        <div className="row" style={{padding: '50px'}}>
            <div className="col-md-2">
            </div>
            <div className="col-md-8">
                <img src="/assets/docs/StateChannel1.png" alt="" style={{
                    display: 'block',
                    width: '100%',
                }}></img>
          </div>
        </div>
        <div className="row" style={{padding: '50px'}}>
            <div className="col-md-2">
            </div>
            <div className="col-md-8">
                <h3>Under development</h3>
                <ul>
                    <li>Time out capability when a player stop playing and block the game.</li>
                </ul>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
}

const boxStyle = {
    padding: '20px',
    width: '100%',
    minHeight: '100px',
    backgroundColor: 'rgba(126, 126, 126, 0.2)',
  }

export default LightPaper