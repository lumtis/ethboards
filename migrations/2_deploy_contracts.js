const EthBoards = artifacts.require("./EthBoards.sol");
const BoardHandler = artifacts.require("./BoardHandler.sol");
const StateController = artifacts.require("./StateController.sol");
const ChessBoard = artifacts.require("./Board/ChessBoard.sol");
const PawnSetRegistry = artifacts.require("./PawnSetRegistry.sol");
const PawnSet = artifacts.require("./PawnSet.sol");

// Chess pawn
const WhitePawn =  artifacts.require("./Board/WhitePawn.sol");
const WhiteRook =  artifacts.require("./Board/WhiteRook.sol");
const WhiteKnight =  artifacts.require("./Board/WhiteKnight.sol");
const WhiteBishop =  artifacts.require("./Board/WhiteBishop.sol");
const WhiteQueen =  artifacts.require("./Board/WhiteQueen.sol");
const WhiteKing =  artifacts.require("./Board/WhiteKing.sol");
const BlackPawn =  artifacts.require("./Board/BlackPawn.sol");
const BlackRook =  artifacts.require("./Board/BlackRook.sol");
const BlackKnight =  artifacts.require("./Board/BlackKnight.sol");
const BlackBishop =  artifacts.require("./Board/BlackBishop.sol");
const BlackQueen =  artifacts.require("./Board/BlackQueen.sol");
const BlackKing =  artifacts.require("./Board/BlackKing.sol");

module.exports = async (deployer, network, accounts) => {
  // Deploy libraries
  await deployer.deploy(StateController);
  deployer.link(StateController, EthBoards);
  deployer.link(StateController, ChessBoard);
  deployer.link(StateController, WhitePawn);
  deployer.link(StateController, BlackPawn);

  // Deploy contracts
  const ethBoards = await deployer.deploy(EthBoards);
  const boardHandler = await deployer.deploy(BoardHandler, ethBoards.address);

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
  for(i=0; i<255-12; i++) {
    chessPawn.push("0x0000000000000000000000000000000000000000")
  }

  const pawnSetAddress = await pawnSetRegistry.createPawnSet("Chess", chessPawn, 12)
  
  // Deploy simplified chess board
  let xArray = [3,3,0,1,2,3,4,5,6,7,0,1,2,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,4,5,6,7]
  let yArray = [0,7,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7]
  let indexArray = [5,11,0,0,0,0,0,0,0,0,1,2,3,4,3,2,1,6,6,6,6,6,6,6,6,7,8,9,10,9,8,7]

  // Fill arrays
  for(i=0; i<40-32; i++) {
    xArray.push(0)
    yArray.push(0)
    indexArray.push(0)
  }

  await boardHandler.createBoard(
    "Simplified Chess",
    ChessBoard.address,
    pawnSetAddress.logs[0].args.pawnSetAddress,
    xArray,
    yArray,
    indexArray,
    32
  );
  
  // Start the first game
  await boardHandler.joinGame(0, {from: accounts[0]})
  await boardHandler.joinGame(0, {from: accounts[1]})

  // Deploy Light Brigade Chess
  xArray = [4,4,0,1,2,3,4,5,6,7,0,1,2,3,4,5,6,7,0,1,2,3,5,6,7,1,3,6]
  yArray = [0,7,1,1,1,1,1,1,1,1,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,0,0,0]
  indexArray = [5,11,0,0,0,0,0,0,0,0,6,6,6,6,6,6,6,6,8,8,8,8,8,8,8,4,4,4]

  // Fill arrays
  for(i=0; i<40-28; i++) {
    xArray.push(0)
    yArray.push(0)
    indexArray.push(0)
  }

  await boardHandler.createBoard(
    "Light Brigade Chess",
    ChessBoard.address,
    pawnSetAddress.logs[0].args.pawnSetAddress,
    xArray,
    yArray,
    indexArray,
    28
  );

  // Start the first game
  await boardHandler.joinGame(1, {from: accounts[0]})
  await boardHandler.joinGame(1, {from: accounts[1]})
};