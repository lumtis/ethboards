import React, { Component } from 'react'

import BoardInfo from './BoardInfo'

class BoardSidebar extends Component {
    render() {
      const {drizzleContext, boardId} = this.props
    
      const boardInfo = <BoardInfo 
        boardId={boardId}
        drizzleContext={drizzleContext}
      />

      return (
        <div style={{
          backgroundColor: 'rgba(126, 126, 126, 0.5)',
          height: '100vh',
          overflowY: 'scroll',
        }}>
          <div style={{marginTop: '20px', marginBottom: '40px', padding: '20px'}}>
              {boardInfo}
          </div>
        </div>
      );
    }
  }

export default BoardSidebar
