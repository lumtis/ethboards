import React, { Component } from 'react'


const infoStyle = {
  top: '60px',
  left: '10px',
  position: 'fixed',
  padding: '20px',
  width: '400px',
  minHeight: '100px',
  backgroundColor: 'rgba(240, 240, 240, 0.9)',
  marginRight: 'auto',
  marginLeft: 'auto',
  marginBottom: '20px',
  zIndex: 1000
};


class InfoSpawn extends Component {
  constructor(props) {
    super(props)

    this.handleMouseHover = this.handleMouseHover.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);

    this.state = {
      isHovering: false
    }
  }

  static defaultProps = {
    infoContent: ''
  }

  componentWillMount() {
  }

  handleMouseHover() {
    this.setState({isHovering: true});
  }

  handleMouseLeave() {
    this.setState({isHovering: false});
  }

  render() {
    if (this.state.isHovering) {
      return (
        <div onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseLeave}>
          <img src="/images/info.png" alt="Nuja" style={{height: '15px'}}></img>
          <div style={infoStyle}>
            <div className="row" style={{padding: '10px'}}>
              <p>{this.props.infoContent}</p>
            </div>
          </div>
        </div>
      )
    }
    else {
      return (
        <div onMouseEnter={this.handleMouseHover} onMouseLeave={this.handleMouseLeave}>
          <img src="/images/info.png" alt="Nuja" style={{height: '15px'}}></img>
        </div>
      )
    }
  }
}

export default InfoSpawn
