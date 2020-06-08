import React, { Component } from 'react'

class Cross extends Component {
    constructor(props) {
        super(props)

        this.state = {
        }
    }

    render() {
        const {x, y} = this.props
        return <img src="/assets/game/bluecross.png" alt="Cross" style={{
            cursor: 'pointer',
            width: '32px',
            position: 'absolute',
            top: y+16+'px',
            left: x+16+'px'
        }}></img>
    }
}

export default Cross
