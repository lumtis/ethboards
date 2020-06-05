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
        <div style={{textAlign: 'center', marginTop: '50px', marginBottom: '50px'}}>
          <h1>The simplest platform to create games on Ethereum</h1>
        </div>
        <div className="row" style={{padding: '30px'}}>
          <div className="col-md-6">
          </div>
          <div className="col-md-6">
            <h1>Backed by a state channel</h1>
          </div>
        </div>
        <div className="row" style={{padding: '30px'}}>
          <div className="col-md-6">
            <h1>Create your own rules with smart contrats</h1>
          </div>
          <div className="col-md-6">
          </div>
        </div>
      </div>
    );
  }
}


export default Presentation
