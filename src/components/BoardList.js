import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'


class BoardList extends Component {
  constructor(props) {
    super(props)

    this.state = {
        boards: []
    }
  }

  async componentDidMount() {
    const {drizzle, initialized} = this.props.drizzleContext
    
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
    const {boards} = this.state
    const boardsUI = boards.map(board =>
        <div key={board.id} className="col-md-4">
            <Link to={'/board/' + board.id}>
              <img src="/assets/general/logo1.png" alt="Board" style={{
                width: '50%',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}></img>
              <h1 style={{
                textAlign:'center',
                marginTop: '40px'
              }}>{board.name}</h1>
            </Link>
        </div>
    )

    return(
      <div>
        <h1 style={{marginTop: '30px', marginLeft: '50px'}}>Available boards:</h1>
        <div className="row" style={{marginTop: '20px', padding: '50px'}}>
          {boardsUI}
        </div>
      </div>
    )
  }
}

export default BoardList

