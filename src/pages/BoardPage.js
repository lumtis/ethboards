import React, { Component } from 'react'
import { DrizzleContext } from "@drizzle/react-plugin"
import { newContextComponents } from "@drizzle/react-components"

import Board from '../components/Board'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'

const {ContractData} = newContextComponents

class BoardPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
    }
  }

  render() {
    const boardId = this.props.match.params.boardId

    return(
      <div>
        <Navbar />
        <DrizzleContext.Consumer>
          {drizzleContext => {
            const {drizzle, drizzleState, initialized} = drizzleContext;

            if(!initialized) {
              return <Loading />
            } else {               
              return (<ContractData
                drizzle={drizzle}
                drizzleState={drizzleState}
                contract="BoardHandler"
                method="getInitialState"
                methodArgs={[boardId]}
                render={(boardState)=>{
                    if (boardState) {
                        return <Board boardState={boardState} boardId={boardId}/>
                    }
                    return null // TODO: 404
                }}
              />)
            }
          }}
        </DrizzleContext.Consumer>
      </div>
    )
  }
}

export default BoardPage



