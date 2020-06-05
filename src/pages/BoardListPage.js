import React, { Component } from 'react'
import { DrizzleContext } from "@drizzle/react-plugin"

import BoardList from '../components/BoardList'
import Loading from '../components/Loading'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'

class BoardListPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {
    return(
      <div>
        <Navbar />
        <DrizzleContext.Consumer>
          {drizzleContext => {
            const {initialized} = drizzleContext;

            if(!initialized) {
              return <Loading />
            } else {
              return <BoardList drizzleContext={drizzleContext} />
            }
          }}
        </DrizzleContext.Consumer>
      </div>
    )
  }
}

export default BoardListPage



