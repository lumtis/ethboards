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
        <img src="/assets/loading.gif" alt="loading" style={{
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '100px',
            width: '40%',
        }}></img>
      </div>
    )
  }
}

export default Loading
