const { expect, use } = require('chai')
const { Contract } = require('ethers')
const { deployContract, MockProvider, solidity } = require('ethereum-waffle')
const StateController = require('../../waffle/StateController.json')

use(solidity)

const getEmptyState = () => {
    const state = []

    for(let i=0; i<121; i++) {
        state.push(0)
    }

    return state
}

describe('StateController', () => {
  const [wallet, walletTo] = new MockProvider().getWallets()
  let stateController

  beforeEach(async () => {
    stateController = await deployContract(wallet, StateController)
  })

  it('can get pieces number', async () => {
    const state = getEmptyState()
    expect(await stateController.getPieceNumber(state)).to.equal(0)

    state[0] = 10

    expect(await stateController.getPieceNumber(state)).to.equal(10)
  })

  // TODO: Add more tests
})