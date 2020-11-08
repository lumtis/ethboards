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

// Mnemonic for test wallets
const mnemonic = 'wait nephew visual song prevent ribbon much stick hour token account food'

// Utility to advance time
const advanceBlockAtTime = (web3,time) => {
    return new Promise((resolve, reject) => {
      web3.currentProvider.send(
        {
          jsonrpc: "2.0",
          method: "evm_mine",
          params: [time],
          id: new Date().getTime(),
        },
        (err, _) => {
          if (err) {
            return reject(err);
          }
          const newBlockHash = web3.eth.getBlock("latest").hash;
  
          return resolve(newBlockHash);
        },
      );
    });
  };

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
    const web3HDWalletProvider = new HDWalletProvider(mnemonic, mockProvider.provider, 0, 2)
    const web3 = new Web3(web3HDWalletProvider);

    let stateController
    let ethBoards
    let noEvents
    let boardHandler
    let boardHandlerOther

    before(async () => {
        // Create the library
        stateController = await deployContract(wallet, StateController)
        
        // Create EthBoards
        link(EthBoards, 'contracts/StateController.sol:StateController', stateController.address)
        ethBoards = await deployContract(wallet, EthBoards)

        // Contract to have no events during games
        noEvents = await deployContract(wallet, NoEvents)

        // Create BoardHandler with EthBoards
        boardHandler = await deployContract(wallet, BoardHandler, [ethBoards.address])

        // Create a chess board with two kings side by side
        link(ChessBoard, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhitePawn, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhiteRook, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhiteKnight, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhiteBishop, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhiteQueen, 'contracts/StateController.sol:StateController', stateController.address)
        link(WhiteKing, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlackPawn, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlackRook, 'contracts/StateController.sol:StateController', stateController.address)
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

        // Deploy simplified chess board
        let xArray = [3,3,0,1,2,3,4,5,6,7,0,1,2,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,4,5,6,7]
        let yArray = [3,4,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7]
        let indexArray = [5,11,0,0,0,0,0,0,0,0,1,2,3,4,3,2,1,6,6,6,6,6,6,6,6,7,8,9,10,9,8,7]

        // Fill arrays
        for(i=0; i<40-32; i++) {
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
            32
        );

        // Start a game to test claim victory
        await boardHandler.joinGame(0)
        boardHandlerOther = boardHandler.connect(other)
        await boardHandlerOther.joinGame(0)

        // Start a second game to test timeout
        await boardHandler.joinGame(0)
        await boardHandlerOther.joinGame(0)

        // Start a third game to test give up
        await boardHandler.joinGame(0)
        await boardHandlerOther.joinGame(0)
    })

    it('can successfully simulate turns and claim victory', async () => {
        // Get the initial state and verify it is correct
        const initialState = await boardHandler.getInitialState(0)
        
        let whiteKingPosition = await stateController.getPiecePosition(initialState, 0)
        let blackKingPosition = await stateController.getPiecePosition(initialState, 1)
        expect(whiteKingPosition).to.deep.equals([3,3])
        expect(blackKingPosition).to.deep.equals([3,4])

        // Simulate the first turn, move the white king to (4,3)
        const move1 = [0,0,4,3]
        const nonce1 = [0,0,0]
        const state1 = await ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            move1,
            initialState
        )

        // Verify first turn output
        whiteKingPosition = await stateController.getPiecePosition(state1, 0)
        blackKingPosition = await stateController.getPiecePosition(state1, 1)
        expect(whiteKingPosition).to.deep.equals([4,3])
        expect(blackKingPosition).to.deep.equals([3,4])

        // Sign the first turn
        let sig = await web3.eth.personal.sign(web3.utils.soliditySha3(
            {t: 'uint[]', v: nonce1},
            {t: 'uint[]', v: move1},
            {t: 'uint[]', v: initialState},
        ), wallet.address)
        const rsv1 = ethjs.fromRpcSig(sig)

        // Simulate the second turn, capture the white king with the black king
        const move2 = [1,0,4,3]
        const nonce2 = [0,0,1]
        const state2 = await ethBoards.simulate(
            boardHandler.address,
            0,
            1,
            move2,
            state1
        )

        // Verify second turn output
        blackKingPosition = await stateController.getPiecePosition(state2, 1)
        expect(blackKingPosition).to.deep.equals([4,3])
        const isWhiteKingAlive = await stateController.isAlive(state2, 0)
        expect(isWhiteKingAlive).to.be.false

        // Sign second turn
        sig = await web3.eth.personal.sign(web3.utils.soliditySha3(
            {t: 'uint[]', v: nonce2},
            {t: 'uint[]', v: move2},
            {t: 'uint[]', v: state1},
        ), other.address)

        const rsv2 = ethjs.fromRpcSig(sig)

        // The player 2 won the game
        // Verify, we can claim victory
        await ethBoards.claimVictory(
            boardHandler.address,
            0,
            0,
            2,
            [move1, move2],
            [rsv1.r, rsv2.r],
            [rsv1.s, rsv2.s],
            [rsv1.v, rsv2.v],
            initialState
        )

        await expect('finishGame').to.be.calledOnContractWith(boardHandler, [0,0,1]);
        await expect('gameFinished').to.be.calledOnContractWith(noEvents, [0,0,other.address,wallet.address]); 
    })

    it('can execute timeouts', async () => {
        // There is initially no pending timeout
        let timeoutInfo = await ethBoards.getTimeoutInfo(boardHandler.address,0,1)
        expect(timeoutInfo.isPending).to.be.false

        const initialState = await boardHandler.getInitialState(0)
        const junkSignature = ethjs.fromRpcSig("0x4d49b3e6b5b872d6f6eaaefb166ca96539299e26c74d6a832a25c46a871144bb408255c1531fb7b40e9b23be22e252ec222110e28c16c974162145c72d108a321c")

        // Start at timestamp 0
        await advanceBlockAtTime(web3, 0)

        // Start a timeout from player 1
        await ethBoards.startTimeout(
            boardHandler.address,
            0,
            1,
            0,
            [[0,0,0,0],[0,0,0,0]],
            [junkSignature.r,junkSignature.r],
            [junkSignature.s,junkSignature.s],
            [0,0],
            initialState
        )

        // Check the timeout exists
        timeoutInfo = await ethBoards.getTimeoutInfo(boardHandler.address,0,1)
        expect(timeoutInfo.isPending).to.be.true

        // Simulate the first turn
        const move1 = [0,0,4,3]
        const nonce1 = [0,1,0]
        const state1 = await ethBoards.simulate(
            boardHandler.address,
            0,
            0,
            move1,
            initialState
        )

        // Sign the first turn
        let sig = await web3.eth.personal.sign(web3.utils.soliditySha3(
            {t: 'uint[]', v: nonce1},
            {t: 'uint[]', v: move1},
            {t: 'uint[]', v: initialState},
        ), wallet.address)
        const rsv1 = ethjs.fromRpcSig(sig)

        // Stop the timeout
        await ethBoards.stopTimeout(
            boardHandler.address,
            0,
            1,
            1,
            [move1,[0,0,0,0]],
            [rsv1.r,junkSignature.r],
            [rsv1.s,junkSignature.s],
            [rsv1.v,0],
            initialState
        )

        // Check the timeout has been cancelled
        timeoutInfo = await ethBoards.getTimeoutInfo(boardHandler.address,0,1)
        expect(timeoutInfo.isPending).to.be.false

        // Start a timeout from player 0
        await advanceBlockAtTime(web3, 5)
        await ethBoards.startTimeout(
            boardHandler.address,
            0,
            1,
            1,
            [move1,[0,0,0,0]],
            [rsv1.r,junkSignature.r],
            [rsv1.s,junkSignature.s],
            [rsv1.v,0],
            initialState
        )

        // Check the timeout exists
        timeoutInfo = await ethBoards.getTimeoutInfo(boardHandler.address,0,1)
        expect(timeoutInfo.isPending).to.be.true

        // Cannot execute the timeout yet
        await expect(ethBoards.executeTimeout(boardHandler.address,0,1)).to.be.revertedWith("The timeout is not reached yet")
    
        // Advance time
        await advanceBlockAtTime(web3, 3600)

        // Execute timeout and check the player 0 won the game
        await ethBoards.executeTimeout(boardHandler.address,0,1)

        await expect('finishGame').to.be.calledOnContractWith(boardHandler, [0,1,0]);
        await expect('gameFinished').to.be.calledOnContractWith(noEvents, [0,1,wallet.address,other.address]);
    })
    
    it('can give up a game', async () => {
        // Execute timeout and check the player 0 won the game
        await boardHandlerOther.giveUp(0,2)
        await expect('gameFinished').to.be.calledOnContractWith(noEvents, [0,2,wallet.address,other.address]);
    })

    it('can trigger joinGame events of board events contract', async () => {
        await boardHandler.joinGame(0)
        await expect('joinGame').to.be.calledOnContractWith(noEvents, [0,3,wallet.address]);
    })
})