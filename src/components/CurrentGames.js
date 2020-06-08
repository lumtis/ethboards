import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'

import store from '../store'
import '../App.css' 

class CurrentGames extends Component {
  constructor(props) {
    super(props)

    this.state = {
        boardId: store.getState().game.boardId,
        games: []
    }

    store.subscribe(() => {
      this.setState({
        boardId: store.getState().game.boardId,
      })
    })
  }

  async componentDidMount() {
    const {boardId} = this.state
    const {drizzleContext} = this.props
    const {drizzle, drizzleState, initialized} = drizzleContext

    if (initialized) {
        const web3 = drizzle.web3
        const boardHandlerInfo = drizzle.contracts.BoardHandler
        const boardHandler = new web3.eth.Contract(boardHandlerInfo.abi, boardHandlerInfo.address)
  
        // Search for games where the address is player A or player B
        const eventsPlayerA = await boardHandler.getPastEvents('GameStarted', {
            fromBlock: 0,
            toBlock: 'latest',
            filter: {
                boardId,
                playerA: drizzleState.accounts[0]
            }
        })

        const eventsPlayerB = await boardHandler.getPastEvents('GameStarted', {
            fromBlock: 0,
            toBlock: 'latest',
            filter: {
                boardId,
                playerB: drizzleState.accounts[0]
            }
        })

        const events = eventsPlayerA.concat(eventsPlayerB)

        console.log(events)

        if (events.length) {
          const games = events.map(rawEvent => {
            const link = '/board/' + rawEvent.returnValues.boardId + '/game/' + rawEvent.returnValues.gameId

            return <tr>
                <td>{rawEvent.returnValues.gameId}</td>
                <td style={{fontSize:'10px'}}>{rawEvent.returnValues.playerA}</td>
                <td style={{fontSize:'10px'}}>{rawEvent.returnValues.playerB}</td>
                <th>
                    <Link to={link}>
                        <button className="button" style={buttontyle}>></button>
                    </Link>
                </th>
            </tr>
          })
  
          this.setState({games})
        }
    }
  }

  render() {
    const {games} = this.state

    return(
      <div style={boxStyle}>
        <h1>Your current games:</h1>
        <table style={{width:'100%'}}>
            <tr>
                <th>Game ID</th>
                <th>Player A</th>
                <th>Player B</th>
                <th></th>
            </tr>
            {games}
        </table>
      </div>
    )
  }
}

const boxStyle = {
  marginTop: '20px',
  padding: '20px',
  width: '100%',
  minHeight: '100px',
  backgroundColor: 'rgba(126, 126, 126, 0.5)',
}

const buttontyle = {
    width: '50px',
    height: '30px',
    fontSize: '18px',
}

export default CurrentGames
