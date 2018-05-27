import React, { Component } from 'react'

import store from '../store'

import Bar from '../components/Bar'
import Map from '../containers/Map'
import Sidebar from '../containers/Sidebar'
import PlayerList from '../containers/PlayerList'


class Play extends Component {
  constructor(props) {
    super(props)

    this.state = {
      server: 0,
    }
  }

  static defaultProps = {
  }

  componentWillMount() {
    if (isNaN(this.props.match.params.serverid) == false) {
      this.setState({server: parseInt(this.props.match.params.serverid)})
    }
  }

  render() {
    // if (this.state.accountInitialized) {
      return (
        <div>
          <Bar style={{paddingRight:'10px'}} />
          <div className="col-md-4" style={{paddingLeft:0, paddingRight:0}}>
            <Sidebar server={this.state.server} />
          </div>
          <div className="col-md-8" style={{paddingRight:0, paddingLeft:0}}>

            <div className="container-fluid" style={{overflowY: 'scroll', height: '100vh', paddingLeft:0, paddingRight:0}}>
              <div className="row" style={{padding: '30px'}}>
                <div className="col-md-12" style={{width:'100%', paddingLeft:'30px'}}>
                  <Map server={this.state.server} />
                </div>
                <div className="col-md-12" style={{width:'100%', top:'660px'}}>
                  <h1 style={{marginBottom: '40px'}}>Other players :</h1>
                  <PlayerList server={this.state.server} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  }
}

export default Play
