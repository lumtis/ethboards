import React, { Component } from 'react'

import store from '../store'

import PawnInfo from '../components/PawnInfo'

/**
 * A Bar that display information on each pawn of the board
 */
class PawnBar extends Component {
    constructor(props) {
      super(props)

      this.state = {
        boardId: store.getState().game.boardId,
        pawnInfos: []
      }

      store.subscribe(() => {
        this.setState({
            boardId: store.getState().game.boardId,
        })
      })
    }

    async componentDidMount() {
        const {drizzleContext} = this.props
        const {drizzle, initialized} = drizzleContext
        const {boardId} = this.state

        if (initialized) {
          const web3 = drizzle.web3
          const boardHandlerInfo = drizzle.contracts.BoardHandler
          const boardHandler = new web3.eth.Contract(boardHandlerInfo.abi, boardHandlerInfo.address)
    
          const events = await boardHandler.getPastEvents('PawnTypeAdded', {
            fromBlock: 0,
            toBlock: 'latest',
            filter: {
                boardId
            }
          })
    
          if (events.length) {
            const pawnInfos = events.map(rawEvent => {
              return <PawnInfo 
                pawnAddress={rawEvent.returnValues.pawnTypeContract}
                drizzleContext={drizzleContext}
              />
            })
    
            this.setState({pawnInfos})
          }
        }
      }

    render() {
      const {pawnInfos} = this.state
    
      return (
        <div style={{
          backgroundColor: 'rgba(126, 126, 126, 0.5)',
          height: '100vh',
          overflowY: 'scroll',
        }}>
          <div style={{marginTop: '20px', marginBottom: '40px', padding: '20px'}}>
              {pawnInfos}
          </div>
        </div>
      );
    }
  }

export default PawnBar
