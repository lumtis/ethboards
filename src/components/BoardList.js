import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'

import BoardInfo from './BoardInfo'

class BoardList extends Component {
  constructor(props) {
    super(props)

    this.state = {
        boards: []
    }
  }

  async componentDidMount() {
    const {drizzleContext} = this.props
    const {drizzle, initialized} = drizzleContext
    
    if (initialized) {
      const web3 = drizzle.web3
      const boardHandlerInfo = drizzle.contracts.BoardHandler
      const boardHandler = new web3.eth.Contract(boardHandlerInfo.abi, boardHandlerInfo.address)

      const events = await boardHandler.getPastEvents('BoardCreated', {
        fromBlock: 0,
        toBlock: 'latest'
      })

      if (events.length) {
        const boards = events.map(rawEvent => {
          return {
            id: rawEvent.returnValues.boardId,
            name: rawEvent.returnValues.name,
          }
        })

        this.setState({boards})
      }
    }
  }

  render() {
    const {drizzleContext} = this.props
    const {boards} = this.state

    const boardsUI = boards.map(board =>
        <div key={board.id} className="col-md-3 col-xs-6">
            <Link to={'/board/' + board.id}>
              <BoardInfo 
                boardId={board.id}
                drizzleContext={drizzleContext}
                onlyImage={true}
              />
              <p style={{
                textAlign:'center',
                marginTop: '20px',
                color: 'black'
              }}>{board.name}</p>
            </Link>
        </div>
    )

    return(
      <div>
        <h1 style={{marginTop: '30px', marginLeft: '50px'}}>Boards:</h1>
        <div className="row" style={{padding: '50px'}}>
          {boardsUI}
        </div>
      </div>
    )
  }
}

export default BoardList

