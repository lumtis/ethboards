const { Contract } = require('ethers')
const { deployContract, MockProvider, solidity, link } = require('ethereum-waffle')
const { expect, use } = require('chai')

const Web3 = require('web3')
const Web3HDWalletProvider = require("web3-hdwallet-provider");
const ethjs = require('ethereumjs-util')

const StateController = require('../../waffle/StateController.json')
const EthBoards = require('../../waffle/EthBoards.json')
const BoardHandler = require('../../waffle/BoardHandler.json')
const ChessBoard = require('../../waffle/ChessBoard.json')
const WhiteKing = require('../../waffle/WhiteKing.json')
const BlackKing = require('../../waffle/BlackKing.json')

use(solidity)

const mnemonic = 'wait nephew visual song prevent ribbon much stick hour token account food'

// Check in the single test the basic feature of the EthBoards contract:
// - Simulating turns
// - Claiming victory
// This test is an integration test that tests features from Board Handler as well
describe('EthBoards', () => {
    const mockProvider = new MockProvider({
        ganacheOptions: {
            // mnemonic,
            accounts: [
                {balance: '1000000000000000000', secretKey: '0x13218411d8d6fcf694e6eb98ddd0151d0097481aee2a5f08a9614f0f5191871d'},
                {balance: '1000000000000000000', secretKey: '0xd7dda04c9528c7a79d0ae7b9df251b6ca4243bda55040393fcc6126b7f0fb3c5'}
            ]
        }
    })
    const [wallet, other] = mockProvider.getWallets()

    // Use web3HDWalletProvider to have the personal sign feature
    const web3HDWalletProvider = new Web3HDWalletProvider(mnemonic, mockProvider.provider)
    const web3 = new Web3(web3HDWalletProvider);

    let stateController
    let ethBoards
    let boardHandler

    before(async () => {
        // Create the library
        stateController = await deployContract(wallet, StateController)
        
        // Create EthBoards
        link(EthBoards, 'contracts/StateController.sol:StateController', stateController.address)
        ethBoards = await deployContract(wallet, EthBoards)

        // Create BoardHandler with EthBoards
        boardHandler = await deployContract(wallet, BoardHandler, [ethBoards.address])

        // Create a chess board with two kings side by side
        link(ChessBoard, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhiteKing, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlackKing, 'contracts/StateController.sol:StateController', stateController.address)
        const chessBoard = await deployContract(wallet, ChessBoard)
        const whiteKing = await deployContract(wallet, WhiteKing)
        const blackKing = await deployContract(wallet, BlackKing)

        await boardHandler.createBoard("ChessTest", chessBoard.address)
        await boardHandler.addPawnTypeToBoard(0, whiteKing.address)
        await boardHandler.addPawnTypeToBoard(0, blackKing.address)
        await boardHandler.addPawnsToBoard(
            0,
            [3,3,0,0,0,0,0,0,0,0],
            [3,4,0,0,0,0,0,0,0,0],
            [0,1,0,0,0,0,0,0,0,0],
            2
        )
        await boardHandler.deployBoard(0)

        // // Start a game
        await boardHandler.joinGame(0)
        const boardHandlerOther = boardHandler.connect(other)
        await boardHandlerOther.joinGame(0)
    })

    it('can successfully simulate turns and claim victory', async () => {
        // Get the initial state and verify it is correct
        const initialState = await boardHandler.getInitialState(0)
        
        let whiteKingPosition = await stateController.getPawnPosition(initialState, 0)
        let blackKingPosition = await stateController.getPawnPosition(initialState, 1)
        expect(whiteKingPosition).to.deep.equals([3,3])
        expect(blackKingPosition).to.deep.equals([3,4])

        // Simulate the first turn, move the white king to (4,3)
        const state1 = await ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [0,0,4,3],
            initialState
        )

        // Verify first turn output
        whiteKingPosition = await stateController.getPawnPosition(state1, 0)
        blackKingPosition = await stateController.getPawnPosition(state1, 1)
        expect(whiteKingPosition).to.deep.equals([4,3])
        expect(blackKingPosition).to.deep.equals([3,4])

        // Sign the first turn
        let sig = await web3.eth.personal.sign(web3.utils.soliditySha3(
            {t: 'uint[]', v: [0,0,0]},
            {t: 'uint[]', v: [0,0,4,3]},
            {t: 'uint[]', v: initialState},
        ), wallet.address)
        const rsv1 = ethjs.fromRpcSig(sig)

        // Simulate the second turn, capture the white king with the black king
        const state2 = await ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [1,0,4,3],
            state1
        )

        // Verify second turn output
        blackKingPosition = await stateController.getPawnPosition(state2, 1)
        expect(blackKingPosition).to.deep.equals([4,3])
        const isWhiteKingAlive = await stateController.isAlive(state2, 0)
        expect(isWhiteKingAlive).to.be.true

        // Sign second turn
        sig = await web3.eth.personal.sign(web3.utils.soliditySha3(
            {t: 'uint[]', v: [0,0,1]},
            {t: 'uint[]', v: [1,0,4,3]},
            {t: 'uint[]', v: state1},
        ), wallet.address)
        const rsv2 = ethjs.fromRpcSig(sig)
    })
})