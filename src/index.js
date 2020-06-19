import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import { Drizzle } from "drizzle";

// Contract artifacts
import EthBoards from './artifacts/EthBoards.json'
import BoardHandler from './artifacts/BoardHandler.json'

require('dotenv').config()

// Contracts
const contracts = [
  EthBoards,
  BoardHandler
]

// Metamask provider
let provider = null
if (typeof window.ethereum !== 'undefined') {
  // Ethereum user detected. You can now use the provider.
  provider = window['ethereum']
}

const drizzleOptions = {
  contracts,
  events: {
    BoardHandler: [
      'BoardCreated',
      'PawnTypeAdded',
      'GameStarted',
      'GameFinished'
    ]
  },
  web3: {
    customProvider: provider,
    // fallback: {
    //   type: "ws",
    //   url: "ws://127.0.0.1:8545",
    // }
  }
}

const drizzle = new Drizzle(drizzleOptions)

ReactDOM.render(
  <App drizzle={drizzle} />,
  document.getElementById('root')
);
