import React, { Component } from 'react'

import '../App.css'

class Presentation extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <div>
        <div className="row" style={{padding: '30px'}}>
          <div className="col-md-8">
            <img src="/assets/docs/SmartContracts1.png" alt="" style={{
                display: 'block',
                width: '100%',
            }}></img>
          </div>
          <div className="col-md-4">
            <h1>Smart contract platform</h1>
            <p>The smart contract platform provides smart contracts to handle 8x8 boards and simulate game turns that occur on this board.</p>
            <p>The user provides his own smart contracts that determine the pawn's behavior in the game. He also provides a smart contract that determines when a player wins the game.</p>
          </div>
        </div>
        <div className="row" style={{padding: '30px'}}>
          <div className="col-md-4">
            <h1>State channel</h1>
            <p>The games are automatically made fast and cheap to play through the use of state channels. A server stores into a database all the state transitions for each game. The state transitions are signed and are used when a player claim victory.</p>
          </div>
          <div className="col-md-8">
            <img src="/assets/docs/StateChannel1.png" alt="" style={{
                display: 'block',
                width: '100%',
              }}></img>
          </div>
        </div>
      </div>
    );
  }
}


export default Presentation
