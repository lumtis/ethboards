import React, { Component } from 'react'

import store from '../store'

import PawnInfo from './PawnInfo'

class Sidebar extends Component {
    constructor(props) {
      super(props)

      this.state = {
        selectedPawn: store.getState().game.selectedPawn,
      }

      store.subscribe(() => {
        this.setState({
          selectedPawn: store.getState().game.selectedPawn,
        })
      })
    }

    render() {
      const {selectedPawn} = this.state
      const {drizzleContext} = this.props
    
      let pawnInfo = null
      if (selectedPawn !== -1) {
        pawnInfo = <PawnInfo 
          pawn={selectedPawn}
          drizzleContext={drizzleContext}
        />
      }

      return (
        <div style={{
          backgroundColor: 'rgba(126, 126, 126, 0.5)',
          height: '100vh',
          overflowY: 'scroll',
        }}>
          <div style={{marginTop: '20px', marginBottom: '40px', padding: '20px'}}>
              {pawnInfo}
          </div>
        </div>
      );
    }
  }

export default Sidebar
