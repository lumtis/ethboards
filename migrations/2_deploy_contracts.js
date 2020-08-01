const EthBoards = artifacts.require("./EthBoards.sol");
const BoardHandler = artifacts.require("./BoardHandler.sol");
const StateController = artifacts.require("./StateController.sol");
const ChessBoard = artifacts.require("./Board/ChessBoard.sol");
const WarfieldBoard = artifacts.require("./Board/WarfieldBoard.sol");
const PawnSetRegistry = artifacts.require("./PawnSetRegistry.sol");
const PawnSet = artifacts.require("./PawnSet.sol");
const NoEvents = artifacts.require('../BoardEvents/NoEvents.sol')

// Chess pawn
const WhitePawn =  artifacts.require("./Chess/WhitePawn.sol");
const WhiteRook =  artifacts.require("./Chess/WhiteRook.sol");
const WhiteKnight =  artifacts.require("./Chess/WhiteKnight.sol");
const WhiteBishop =  artifacts.require("./Chess/WhiteBishop.sol");
const WhiteQueen =  artifacts.require("./Chess/WhiteQueen.sol");
const WhiteKing =  artifacts.require("./Chess/WhiteKing.sol");
const BlackPawn =  artifacts.require("./Chess/BlackPawn.sol");
const BlackRook =  artifacts.require("./Chess/BlackRook.sol");
const BlackKnight =  artifacts.require("./Chess/BlackKnight.sol");
const BlackBishop =  artifacts.require("./Chess/BlackBishop.sol");
const BlackQueen =  artifacts.require("./Chess/BlackQueen.sol");
const BlackKing =  artifacts.require("./Chess/BlackKing.sol");

// Warfield pawn
const BlueBase =  artifacts.require("./Warfield/BlueBase.sol");
const BlueSoldier =  artifacts.require("./Warfield/BlueSoldier.sol");
const BlueBazooka =  artifacts.require("./Warfield/BlueBazooka.sol");
const BlueTank =  artifacts.require("./Warfield/BlueTank.sol");
const RedBase =  artifacts.require("./Warfield/RedBase.sol");
const RedSoldier =  artifacts.require("./Warfield/RedSoldier.sol");
const RedBazooka =  artifacts.require("./Warfield/RedBazooka.sol");
const RedTank =  artifacts.require("./Warfield/RedTank.sol");
const BlueHeadquarters =  artifacts.require("./Warfield/BlueHeadquarters.sol");
const RedHeadquarters =  artifacts.require("./Warfield/RedHeadquarters.sol");

module.exports = async (deployer, network, accounts) => {
  // Deploy libraries
  await deployer.deploy(StateController);
  deployer.link(StateController, EthBoards);
  deployer.link(StateController, ChessBoard);
  deployer.link(StateController, WarfieldBoard);

  // Deploy contracts
  const ethBoards = await deployer.deploy(EthBoards);
  const boardHandler = await deployer.deploy(BoardHandler, ethBoards.address);
  const noEvents = await deployer.deploy(NoEvents);

  ///////////////////////////////////////////////////////////
  // Link library to pawn
  deployer.link(StateController, WhitePawn);
  deployer.link(StateController, WhiteRook);
  deployer.link(StateController, WhiteKnight);
  deployer.link(StateController, WhiteBishop);
  deployer.link(StateController, WhiteQueen);
  deployer.link(StateController, WhiteKing);
  deployer.link(StateController, BlackPawn);
  deployer.link(StateController, BlackRook);
  deployer.link(StateController, BlackKnight);
  deployer.link(StateController, BlackBishop);
  deployer.link(StateController, BlackQueen);
  deployer.link(StateController, BlackKing);

  // Link library to warflied pawn
  deployer.link(StateController, BlueBase);
  deployer.link(StateController, BlueSoldier);
  deployer.link(StateController, BlueBazooka);
  deployer.link(StateController, BlueTank);
  deployer.link(StateController, RedBase);
  deployer.link(StateController, RedSoldier);
  deployer.link(StateController, RedBazooka);
  deployer.link(StateController, RedTank);
  deployer.link(StateController, BlueHeadquarters);
  deployer.link(StateController, RedHeadquarters);

  ///////////////////////////////////////////////////////////
  // Deploy chess contracts and pawns
  await deployer.deploy(ChessBoard);
  await deployer.deploy(WhitePawn);
  await deployer.deploy(WhiteRook);
  await deployer.deploy(WhiteKnight);
  await deployer.deploy(WhiteBishop);
  await deployer.deploy(WhiteQueen);
  await deployer.deploy(WhiteKing);
  await deployer.deploy(BlackPawn);
  await deployer.deploy(BlackRook);
  await deployer.deploy(BlackKnight);
  await deployer.deploy(BlackBishop);
  await deployer.deploy(BlackQueen);
  await deployer.deploy(BlackKing);

  // Deploy warfield contracts
  await deployer.deploy(WarfieldBoard);
  await deployer.deploy(BlueBase);
  await deployer.deploy(BlueSoldier);
  await deployer.deploy(BlueBazooka);
  await deployer.deploy(BlueTank);
  await deployer.deploy(RedBase);
  await deployer.deploy(RedSoldier);
  await deployer.deploy(RedBazooka);
  await deployer.deploy(RedTank);
  await deployer.deploy(BlueHeadquarters);
  await deployer.deploy(RedHeadquarters);

  ///////////////////////////////////////////////////////////
  // Deploy pawn set register and create the Chess pawn set
  const pawnSetRegistry = await deployer.deploy(PawnSetRegistry);

  const chessPawn = [
    WhitePawn.address,
    WhiteRook.address,
    WhiteKnight.address,
    WhiteBishop.address,
    WhiteQueen.address,
    WhiteKing.address,
    BlackPawn.address,
    BlackRook.address,
    BlackKnight.address,
    BlackBishop.address,
    BlackQueen.address,
    BlackKing.address
  ]

  // Fill the remaining spaces in the array
  for(let i=0; i<255-12; i++) {
    chessPawn.push("0x0000000000000000000000000000000000000000")
  }

  const chessPawnSetAddress = await pawnSetRegistry.createPawnSet("Chess", chessPawn, 12)
  
  ///////////////////////////////////////////////////////////
  // Create the pawn set for Warfield
  const warfieldPawn = [
    BlueBase.address,
    BlueSoldier.address,
    BlueBazooka.address,
    BlueTank.address,
    BlueHeadquarters.address,
    RedBase.address,
    RedSoldier.address,
    RedBazooka.address,
    RedTank.address,
    RedHeadquarters.address
  ]
  for(let i=0; i<255-10; i++) {
    warfieldPawn.push("0x0000000000000000000000000000000000000000")
  }
  const warfieldPawnSetAddress = await pawnSetRegistry.createPawnSet("Warfield", warfieldPawn, 10)
};
//   ///////////////////////////////////////////////////////////
//   // Deploy simplified chess board
//   let xArray = [3,3,0,1,2,3,4,5,6,7,0,1,2,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,4,5,6,7,0,0,0,0,0,0,0,0]
//   let yArray = [0,7,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0]
//   let indexArray = [5,11,0,0,0,0,0,0,0,0,1,2,3,4,3,2,1,6,6,6,6,6,6,6,6,7,8,9,10,9,8,7,0,0,0,0,0,0,0,0]
//   await boardHandler.createBoard(
//     "Simplified Chess",
//     ChessBoard.address,
//     chessPawnSetAddress.logs[0].args.pawnSetAddress,
//     NoEvents.address,
//     xArray,
//     yArray,
//     indexArray,
//     32
//   );
  
//   // Start the first game
//   await boardHandler.joinGame(0, {from: accounts[0]})
//   await boardHandler.joinGame(0, {from: accounts[1]})

//   ///////////////////////////////////////////////////////////
//   // Deploy Light Brigade Chess
//   xArray = [4,4,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,5,6,7,1,3,6,0,0,0,0,0,0,0,0,0,0,0,0]
//   yArray = [0,7,1,1,1,1,1,1,1,1,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
//   indexArray = [5,11,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,8,8,8,8,8,8,8,4,4,4,0,0,0,0,0,0,0,0,0,0,0,0]

//   await boardHandler.createBoard(
//     "Light Brigade Chess",
//     ChessBoard.address,
//     chessPawnSetAddress.logs[0].args.pawnSetAddress,
//     NoEvents.address,
//     xArray,
//     yArray,
//     indexArray,
//     28
//   );

//   // Start the first game
//   await boardHandler.joinGame(1, {from: accounts[0]})
//   await boardHandler.joinGame(1, {from: accounts[1]})

//   ///////////////////////////////////////////////////////////
//   // Deploy Warfield
//   xArray = [5,2,0,0,2,1,1,2,2,2,2,0,7,7,5,6,6,5,5,5,5,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
//   yArray = [5,2,0,7,5,2,5,3,4,1,6,3,0,7,2,2,5,3,4,1,6,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
//   indexArray = [4,9,5,5,5,6,6,6,6,7,7,8,0,0,0,1,1,1,1,2,2,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]

//   await boardHandler.createBoard(
//     "Warfield test",
//     WarfieldBoard.address,
//     warfieldPawnSetAddress.logs[0].args.pawnSetAddress,
//     NoEvents.address,
//     xArray,
//     yArray,
//     indexArray,
//     22
//   );

//   // Start the first game
//   await boardHandler.joinGame(2, {from: accounts[0]})
//   await boardHandler.joinGame(2, {from: accounts[1]})
// };