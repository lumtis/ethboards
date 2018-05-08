import React, { Component } from 'react'
import { BrowserRouter as Router, Link } from 'react-router-dom'
import store from '../store'

/*
  Get list of all server
*/

var flatColorList = [
  '#55efc4',
  '#74b9ff',
  '#a29bfe',
  '#fab1a0',
  '#b2bec3',
  '#ffeaa7'
]

const infoStyle = {
  position: 'relative',
  padding: '20px',
  width: '80%',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 0.7)',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginBottom: '20px'
};


class AllServers extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaBattle: store.getState().web3.nujaBattleInstance,
      serverArray: [],
    }

    store.subscribe(() => {
      this.setState({
        nujaBattle: store.getState().web3.nujaBattleInstance,
      });
    });
  }

  static defaultProps = {
  }

  componentWillMount() {
    var self = this

    if (self.state.nujaBattle != null) {

        self.state.nujaBattle.methods.getServerNb().call().then(function(serverNb) {
          for (var i = 0; i < serverNb; i++) {
            self.state.nujaBattle.methods.getServerInfo(i).call().then(function(infos) {

              // Change icon depending on server running
              if (infos.runningRet) {
                var runIcon = <i class="fas fa-play"></i>
              }
              else {
                runIcon = <i class="fas fa-pause"></i>
              }

              var route = '/play/' + toString(this.serverId)

              // Specifying server button
              var serverArrayTmp = self.state.serverArray
              serverArrayTmp.push(
                <div key={this.serverId} style={infoStyle} className="col-md-12">
                  <Link to={route}>
                    {runIcon}
                    {infos.nameRet}
                    {infos.playerNbRet}
                    {infos.playerMaxRet}
                  </Link>
                </div>
              )
              self.setState({serverArray: serverArrayTmp})
            }.bind({serverId: i}))
          }
        })
    }
  }

  render() {
    return (
      <div className="row">
        {this.state.serverArray}
      </div>
    )
  }
}

export default AllServers
