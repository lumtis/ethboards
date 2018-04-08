import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom'

import Player from '../components/Player'
import Actions from '../components/Actions'

import store from '../store'


var noop = function() {};

class Sidebar extends Component {
  constructor(props) {
    super(props)

    this.state = {
      account: store.getState().account.accountInstance
    }

    store.subscribe(() => {
      this.setState({
        account: store.getState().account.accountInstance
      });
    });
  }

  static defaultProps = {
  }

  componentWillMount() {
  }

  render() {
    var content = <div></div>

    if (this.state.account == null) {
      content = <h3>Please install metamask</h3>
    }
    else {
      content =
      <div>
        <Player />
        <Actions />
      </div>
    }

    return (
      <div style={{backgroundColor: '#16D7AC', height: '100vh', overflowY: 'scroll'}}>
        <div style={{marginTop: '20px', padding: '20px'}}>
          {content}
        </div>
      </div>
    );
  }
}

export default Sidebar
