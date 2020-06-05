import React, { Component } from 'react'

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
            <p>{board.name}</p>
        </div>
    )

    return(
      <div>
        <div className="row" style={{marginTop: '30px'}}>
          {boardsUI}
        </div>
      </div>
    )
  }
}

export default BoardList


// TODO: Remove this
// debug
// const boards = [
//     {
//         id:0,
//         name:'Chess'
//     },
//     {
//         id:1,
//         name:'Draughts'
//     }, 
//     {
//         id:2,
//         name:'Toast'
//     }, 
//     {
//         id:3,
//         name:'Nuja'
//     }, 
//     {
//         id:4,
//         name:'Haha'
//     }, 
// ]
