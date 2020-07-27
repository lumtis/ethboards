const { Contract } = require('ethers')
const { deployContract, MockProvider, solidity, link } = require('ethereum-waffle')
const { expect, use } = require('chai')

const Web3 = require('web3')
const HDWalletProvider = require("@truffle/hdwallet-provider");
const ethjs = require('ethereumjs-util')

const StateController = require('../../waffle/StateController.json')
const EthBoards = require('../../waffle/EthBoards.json')
const BoardHandler = require('../../waffle/BoardHandler.json')
const WarfieldBoard = require('../../waffle/WarfieldBoard.json')

const PawnSet = require('../../waffle/PawnSet.json')

const BlueBase = require("../../waffle/BlueBase.json");
const BlueSoldier = require("../../waffle/BlueSoldier.json");
const BlueBazooka = require("../../waffle/BlueBazooka.json");
const BlueTank = require("../../waffle/BlueTank.json");
const RedBase = require("../../waffle/RedBase.json");
const RedSoldier = require("../../waffle/RedSoldier.json");
const RedBazooka = require("../../waffle/RedBazooka.json");
const RedTank = require("../../waffle/RedTank.json");

use(solidity)

const mnemonic = 'wait nephew visual song prevent ribbon much stick hour token account food'

// Test chess pawn moves
// These tess are not exhaustive, we only test for each pawn a invalid move and a valid move
describe('Warfield', () => {
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

        // Create a chess board with two kings side by side
        link(WarfieldBoard, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlueBase, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlueSoldier, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlueBazooka, 'contracts/StateController.sol:StateController', stateController.address)
        link(BlueTank, 'contracts/StateController.sol:StateController', stateController.address)
        link(RedBase, 'contracts/StateController.sol:StateController', stateController.address)
        link(RedSoldier, 'contracts/StateController.sol:StateController', stateController.address)
        link(RedBazooka, 'contracts/StateController.sol:StateController', stateController.address)
        link(RedTank, 'contracts/StateController.sol:StateController', stateController.address)

        const warfieldBoard = await deployContract(wallet, WarfieldBoard)
        const blueBase = await deployContract(wallet, BlueBase)
        const blueSoldier = await deployContract(wallet, BlueSoldier)
        const blueBazooka = await deployContract(wallet, BlueBazooka)
        const blueTank = await deployContract(wallet, BlueTank)
        const redBase = await deployContract(wallet, RedBase)
        const redSoldier = await deployContract(wallet, RedSoldier)
        const redBazooka = await deployContract(wallet, RedBazooka)
        const redTank = await deployContract(wallet, RedTank)

        const warfieldPawns = [
            blueBase.address,
            blueSoldier.address,
            blueBazooka.address,
            blueTank.address,
            redBase.address,
            redSoldier.address,
            redBazooka.address,
            redTank.address,
        ]
    
        // Fill the remaining spaces in the array
        for(let i=0; i<255-8; i++) {
            warfieldPawns.push("0x0000000000000000000000000000000000000000")
        }

        const pawnSet = await deployContract(wallet, PawnSet, [warfieldPawns, 12])

        // Deploy a test board for chess with each pawn one to each other
        const xArray = [0,0,2,2,1,1,2,2,2,2,0,7,7,5,5,6,6,5,5,5,5,7]
        const yArray = [0,7,2,5,2,5,3,4,1,6,3,0,7,2,5,2,5,3,4,1,6,4]
        const indexArray = [0,0,0,0,5,5,5,5,6,6,7,0,0,0,0,1,1,1,1,2,2,3]
      
        // Fill arrays
        for(let i=0; i<40-22; i++) {
          xArray.push(0)
          yArray.push(0)
          indexArray.push(0)
        }
      
        await boardHandler.createBoard(
          "Warfield",
          warfieldBoard.address,
          pawnSet.address,
          xArray,
          yArray,
          indexArray,
          22
        );

        initialState = await boardHandler.getInitialState(0)

        const junkSignature = ethjs.fromRpcSig("0x4d49b3e6b5b872d6f6eaaefb166ca96539299e26c74d6a832a25c46a871144bb408255c1531fb7b40e9b23be22e252ec222110e28c16c974162145c72d108a321c")

        // There is no red base, player A already won
        await ethBoards.claimVictory(
            boardHandler.address,
            0,
            0,
            0,
            [[0,0,0,0],[0,0,0,0]],
            [junkSignature.r,junkSignature.r],
            [junkSignature.s,junkSignature.s],
            [0,0],
            initialState
        )

        expect('finishGame').to.be.calledOnContractWith(boardHandler, [0,0,0]);
    })
})