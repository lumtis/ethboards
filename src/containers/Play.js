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
      // accountInitialized: false
    }
  }

  static defaultProps = {
  }

  componentWillMount() {
    var self = this
    var web3 = store.getState().web3.web3Instance

    if (Number.isInteger(this.props.match.params.serverid)) {
      this.setState({server: parseInt(this.props.match.params.serverid)})
    }

    // web3.eth.getAccounts(function(err, accounts) {
    //   if (accounts.length > 0) {
    //     var account = {"address":accounts[0], "privateKey":""}
    //     store.dispatch({type: 'ACCOUNT_LOGIN', payload: {accountInstance: account}})
    //     self.setState({accountInitialized: true})
    //   }
    //   else {
    //     self.setState({accountInitialized: true})
    //   }
    // })
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
    // }
    // else {
    //   return (<div></div>)
    // }
  }
}

export default Play
