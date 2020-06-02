import React, { Component } from 'react'

import '../App.css'

const infoStyle = {
  padding: '20px',
  width: '100%',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 1)',
  boxShadow:'5px 5px rgba(0, 0, 0, 1)'
};

const infoStyle2 = {
  marginRight: 'auto',
  marginLeft: 'auto',
  marginTop: '40px',
  marginBottom: '40px',
  padding: '20px',
  width: '700px',
  position: 'relative',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 1)',
  boxShadow:'5px 5px rgba(0, 0, 0, 1)'
};

const imageStyle = {
  position: 'relative',
  width: '100%',
  borderStyle:'solid',
  borderWidth:'1px',
  backgroundImage:'url(\'/images/vaporbg.jpg\')'
}

const imageStyle2 = {
  position: 'relative',
  width: '100%',
  borderStyle:'solid',
  borderWidth:'1px',
  backgroundImage:'url(\'/images/vaporbg2.jpg\')'
}

const imageStyle3 = {
  position: 'relative',
  width: '100%',
  borderStyle:'solid',
  borderWidth:'1px',
  backgroundImage:'url(\'/images/vaporbg3.jpg\')'
}


class Presentation extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <div>
        <div style={{textAlign: 'center', marginTop: '50px', marginBottom: '50px'}}>
          <h1>Collectibles</h1>
          <h1>Battle royale</h1>
          <h1>Offchain transactions</h1>
        </div>
        <div className="row" style={{padding: '30px'}}>
          <div className="col-md-6">
          </div>
          <div className="col-md-6">
            <div style={infoStyle}>
              <h1>Battle royale</h1>
            </div>
          </div>
        </div>
        <div className="row" style={{padding: '30px'}}>
          <div className="col-md-6">
            <div style={infoStyle}>
              <h1>Create your own server</h1>
            </div>
          </div>
          <div className="col-md-6">
          </div>
        </div>
        <div className="row" style={{padding: '30px'}}>
          <div className="col-md-6">
          </div>
          <div className="col-md-6">
            <div style={infoStyle}>
              <h1>Nearly no fee</h1>
              <p>The game is backed by a multiplayer state channel. Once you join the game, every move is processed offchain and therefore you have no fee to pay or transaction delay</p>
            </div>
          </div>
        </div>
        <div className="row" style={{padding: '10px'}}>
          <div className="col-md-12">
            <div style={infoStyle2}>
              <h1>Important</h1>
            </div>
          </div>
        </div>
        <div className="row" style={{padding: '10px'}}>
          <div className="col-md-12" style={{textAlign: 'center'}}>
            <div style={infoStyle2}>
              <h1>Main Smart Contract</h1>
            </div>
          </div>
        </div>
      </div>
    );
  }
}


export default Presentation
