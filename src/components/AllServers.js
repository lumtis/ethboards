import React, { Component } from 'react'
import { withRouter, BrowserRouter as Router } from 'react-router-dom'
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

const chooseStyle = {
  position: 'relative',
  width: '100%',
  height: '65px',
};


class AllServers extends Component {
  constructor(props) {
    super(props)

    // this.changeServer = this.changeServer.bind(this)

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

              var route = '/play/' + this.serverId.toString()

              // Get a random color for background
              var ranIndex = Math.floor((Math.random() * flatColorList.length))
              var ranColor = flatColorList[ranIndex]

              // using withRouter to be able to update the route
              const ChangeServerComponent = withRouter(({ history }) => (
                <a style={{cursor: 'pointer'}}
                onClick={() =>
                  {
                    history.push(route)
                    window.location.reload()
                  }}
                >
                  <h1>
                    {infos.nameRet} (
                    {infos.playerNbRet}/
                    {infos.playerMaxRet})
                  </h1>
                </a>
              ))

              // Specifying server button
              var serverArrayTmp = self.state.serverArray
              serverArrayTmp.push(
                <div key={this.serverId} style={Object.assign({}, chooseStyle, {backgroundColor: ranColor})} className="col-md-12">
                  <ChangeServerComponent />
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
