import React, { Component } from 'react'
import store from '../store'
import Nuja from '../components/Nuja'
import Bar from '../components/Bar'

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


class NujaPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      nujaRegistry: store.getState().web3.nujaRegistryInstance,
      nujaArray: [],
    }

    store.subscribe(() => {
      this.setState({
        nujaRegistry: store.getState().web3.nujaRegistryInstance,
      })
    })
  }

  componentWillMount() {
    var self = this

    if (self.state.nujaRegistry != null) {
      self.state.nujaRegistry.methods.getNujaNumber().call().then(function(nujaNb) {
        for (var i = 0; i < nujaNb; i++) {
          // Add nuja
          var nujaArrayTmp = self.state.nujaArray
          nujaArrayTmp.push(
            <div key={i} className="col-md-12">
              <Nuja nujaIndex={i} />
            </div>
          )
          self.setState({nujaArray: nujaArrayTmp})
        }
      })
    }
  }

  render() {
    // Informations about weapons
    var infoNuja =
      <div style={infoStyle}>
        <h1>Nuja</h1>
        <p>All information about nuja</p>
      </div>

    return(
      <div>
        <Bar style={{paddingRight:'10px'}} />
        <div style={{marginTop:'30px'}} className="row">
          <div className="col-md-6" style={{}}>
           {infoNuja}
          </div>
          <div className="col-md-6" style={{}}>
            <div className="row">
              {this.state.nujaArray}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default NujaPage
