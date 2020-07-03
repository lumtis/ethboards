import React, { Component } from 'react'

class Loading extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {
    return(
      <div>
        <div style={{textAlign: 'center', marginTop: '200px', marginBottom: '50px'}}>
            <p style={{color: '#D82600'}}>⚠️ You must be connected to Rinkeby network</p>
        </div>
        <img src="/assets/loading.gif" alt="loading" style={{
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '100px',
            width: '100px',
        }}></img>
      </div>
    )
  }
}

export default Loading
