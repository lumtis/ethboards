import { generateStore } from 'drizzle'

// Contract artifacts
const tokenClash = require('../../build/contracts/TokenClash.json')
const boardHandler = require('../../build/contracts/BoardHandler.json')

// Contracts
const contracts = [
  tokenClash,
  boardHandler
]

// Metamask provider
let provider = null
if (typeof window.ethereum !== 'undefined') {
  // Ethereum user detected. You can now use the provider.
  provider = window['ethereum'];
}

const drizzleOptions = {
  contracts,
  events: {
    BoardHandler: [
      'BoardCreated',
      'GameStarted',
      'GameFinished'
    ]
  },
  web3: {
    provider,
  }
}

const store = generateStore({
  drizzleOptions,
 })
 
 export default store