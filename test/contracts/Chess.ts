const { Contract } = require('ethers')
const { deployContract, MockProvider, solidity, link } = require('ethereum-waffle')
const { expect, use } = require('chai')

const Web3 = require('web3')
const HDWalletProvider = require("@truffle/hdwallet-provider");
const ethjs = require('ethereumjs-util')

const StateController = require('../../waffle/StateController.json')
const EthBoards = require('../../waffle/EthBoards.json')
const BoardHandler = require('../../waffle/BoardHandler.json')
const ChessBoard = require('../../waffle/ChessBoard.json')

const PieceSet = require('../../waffle/PieceSet.json')
const NoEvents = require('../../waffle/NoEvents.json')

const WhitePawn = require("../../waffle/WhitePawn.json");
const WhiteRook = require("../../waffle/WhiteRook.json");
const WhiteKnight = require("../../waffle/WhiteKnight.json");
const WhiteBishop = require("../../waffle/WhiteBishop.json");
const WhiteQueen = require("../../waffle/WhiteQueen.json");
const WhiteKing = require('../../waffle/WhiteKing.json')
const BlackPawn = require("../../waffle/BlackPawn.json");
const BlackRook = require("../../waffle/BlackRook.json");
const BlackKnight = require("../../waffle/BlackKnight.json");
const BlackBishop = require("../../waffle/BlackBishop.json");
const BlackQueen = require("../../waffle/BlackQueen.json");
const BlackKing = require('../../waffle/BlackKing.json')

use(solidity)

const mnemonic = 'wait nephew visual song prevent ribbon much stick hour token account food'

// Test chess piece moves
// These tess are not exhaustive, we only test for each piece a invalid move and a valid move
describe('Chess board', () => {
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
    const web3HDWalletProvider = new HDWalletProvider(mnemonic, mockProvider.provider, 0, 2)
    const web3 = new Web3(web3HDWalletProvider);

    let stateController
    let ethBoards
    let noEvents
    let boardHandler
    let initialState

    before(async () => {
        // Create the library
        stateController = await deployContract(wallet, StateController)
        
        // Create EthBoards
        link(EthBoards, 'contracts/StateController.sol:StateController', stateController.address)
        ethBoards = await deployContract(wallet, EthBoards)

        // Create BoardHandler with EthBoards
        boardHandler = await deployContract(wallet, BoardHandler, [ethBoards.address])

        // Contract to have no events during games
        noEvents = await deployContract(wallet, NoEvents)
        
        // Create a chess board with two kings side by side
        link(BlackRook, 'contracts/StateController.sol:StateController', stateController.address)
        link(ChessBoard, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlackPawn, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhiteRook, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhitePawn, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhiteKnight, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhiteBishop, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhiteQueen, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhiteKing, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlackKnight, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlackBishop, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlackQueen, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlackKing, 'contracts/StateController.sol:StateController', stateController.address)

        const chessBoard = await deployContract(wallet, ChessBoard)
        const whitePawn = await deployContract(wallet, WhitePawn)
        const whiteRook = await deployContract(wallet, WhiteRook)
        const whiteKnight = await deployContract(wallet, WhiteKnight)
        const whiteBishop = await deployContract(wallet, WhiteBishop)
        const whiteQueen = await deployContract(wallet, WhiteQueen)
        const whiteKing = await deployContract(wallet, WhiteKing)
        const blackPawn = await deployContract(wallet, BlackPawn)
        const blackRook = await deployContract(wallet, BlackRook)
        const blackKnight = await deployContract(wallet, BlackKnight)
        const blackBishop = await deployContract(wallet, BlackBishop)
        const blackQueen = await deployContract(wallet, BlackQueen)
        const blackKing = await deployContract(wallet, BlackKing)

        const chessPieces = [
            whitePawn.address,
            whiteRook.address,
            whiteKnight.address,
            whiteBishop.address,
            whiteQueen.address,
            whiteKing.address,
            blackPawn.address,
            blackRook.address,
            blackKnight.address,
            blackBishop.address,
            blackQueen.address,
            blackKing.address
        ]
    
        // Fill the remaining spaces in the array
        for(let i=0; i<255-12; i++) {
            chessPieces.push("0x0000000000000000000000000000000000000000")
        }

        const pieceSet = await deployContract(wallet, PieceSet, [chessPieces, 12])

        // Deploy a test board for chess with each piece one to each other
        let xArray = [0,0,1,1,2,2,3,3,4,4,5,5]
        let yArray = [0,7,0,7,0,7,0,7,0,7,0,7]
        let indexArray = [5,11,4,10,3,9,2,8,1,7,0,6]

        // Fill arrays
        for(let i=0; i<40-12; i++) {
            xArray.push(0)
            yArray.push(0)
            indexArray.push(0)
        }

        await boardHandler.createBoard(
            "Test Chess",
            chessBoard.address,
            pieceSet.address,
            noEvents.address,
            xArray,
            yArray,
            indexArray,
            12
        );

        initialState = await boardHandler.getInitialState(0)
    })

    it('Prevent the player 1 from moving a white piece', async () => {
        // Test each white pieces
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [0,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a white piece")
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [2,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a white piece")
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [4,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a white piece")
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [6,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a white piece")
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [8,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a white piece")
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [10,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a white piece")
    })

    it('Prevent the player 0 from moving a black piece', async () => {
        // Test each black pieces
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [1,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a black piece")
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [3,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a black piece")
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [5,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a black piece")
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [7,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a black piece")
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [9,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a black piece")
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [11,0,0,0],
            initialState
        )).to.be.revertedWith("Player can't move a black piece")
    })

    it('can move white king correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 0)
        expect(piecePosition).to.deep.equals([0,0])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [0,0,0,2],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [0,0,1,1],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 0)
        expect(piecePosition).to.deep.equals([1,1])
    })

    it('can move black king correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 1)
        expect(piecePosition).to.deep.equals([0,7])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [1,0,0,5],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [1,0,0,6],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 1)
        expect(piecePosition).to.deep.equals([0,6])
    })

    it('can move white queen correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 2)
        expect(piecePosition).to.deep.equals([1,0])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [2,0,4,4],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [2,0,4,3],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 2)
        expect(piecePosition).to.deep.equals([4,3])
    })

    it('can move black queen correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 3)
        expect(piecePosition).to.deep.equals([1,7])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [3,0,4,3],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [3,0,4,4],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 3)
        expect(piecePosition).to.deep.equals([4,4])
    })

    it('can move white bishop correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 4)
        expect(piecePosition).to.deep.equals([2,0])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [4,0,2,4],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [4,0,5,3],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 4)
        expect(piecePosition).to.deep.equals([5,3])
    })

    it('can move black bishop correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 5)
        expect(piecePosition).to.deep.equals([2,7])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [5,0,2,4],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [5,0,5,4],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 5)
        expect(piecePosition).to.deep.equals([5,4])
    })

    it('can move white knight correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 6)
        expect(piecePosition).to.deep.equals([3,0])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [6,0,3,1],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [6,0,4,2],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 6)
        expect(piecePosition).to.deep.equals([4,2])
    })

    it('can move black knight correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 7)
        expect(piecePosition).to.deep.equals([3,7])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [7,0,4,6],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [7,0,4,5],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 7)
        expect(piecePosition).to.deep.equals([4,5])
    })

    it('can move white rook correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 8)
        expect(piecePosition).to.deep.equals([4,0])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [8,0,6,2],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [8,0,4,5],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 8)
        expect(piecePosition).to.deep.equals([4,5])
    })

    it('can move black rook correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 9)
        expect(piecePosition).to.deep.equals([4,7])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [9,0,2,5],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [9,0,4,1],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 9)
        expect(piecePosition).to.deep.equals([4,1])
    })

    it('can move white piece correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 10)
        expect(piecePosition).to.deep.equals([5,0])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [10,0,6,1],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            [10,0,5,1],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 10)
        expect(piecePosition).to.deep.equals([5,1])
    })

    it('can move black piece correctly', async () => {
        let piecePosition = await stateController.getPiecePosition(initialState, 11)
        expect(piecePosition).to.deep.equals([5,7])

        // Invalid move
        await expect(ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [11,0,5,4],
            initialState
        )).to.be.reverted

        // Valid move
        const newState = await ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            [11,0,5,6],
            initialState
        )

        piecePosition = await stateController.getPiecePosition(newState, 11)
        expect(piecePosition).to.deep.equals([5,6])
    })
})