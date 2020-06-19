const EthBoards = artifacts.require("./EthBoards.sol");
const BoardHandler = artifacts.require("./BoardHandler.sol");
const StateController =  artifacts.require("./StateController.sol");
const ChessBoard =  artifacts.require("./Board/ChessBoard.sol");

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

  // Deploy Boards
  await deployChessBoard(boardHandler, accounts)
  await deployLightBrigadeChessBoard(boardHandler, accounts)
};

const deployChessBoard = async (boardHandler, accounts) => {
  // Create the chess board and pawns
  await boardHandler.createBoard("Chess", ChessBoard.address);
  await boardHandler.addPawnTypeToBoard(0, WhitePawn.address);
  await boardHandler.addPawnTypeToBoard(0, WhiteRook.address);
  await boardHandler.addPawnTypeToBoard(0, WhiteKnight.address);
  await boardHandler.addPawnTypeToBoard(0, WhiteBishop.address);
  await boardHandler.addPawnTypeToBoard(0, WhiteQueen.address);
  await boardHandler.addPawnTypeToBoard(0, WhiteKing.address);
  await boardHandler.addPawnTypeToBoard(0, BlackPawn.address);
  await boardHandler.addPawnTypeToBoard(0, BlackRook.address);
  await boardHandler.addPawnTypeToBoard(0, BlackKnight.address);
  await boardHandler.addPawnTypeToBoard(0, BlackBishop.address);
  await boardHandler.addPawnTypeToBoard(0, BlackQueen.address);
  await boardHandler.addPawnTypeToBoard(0, BlackKing.address);

  // Place pawns on the chess board
  await boardHandler.addPawnsToBoard(
  0,
  [3,3,0,1,2,3,4,5,6,7],
  [0,7,1,1,1,1,1,1,1,1],
  [5,11,0,0,0,0,0,0,0,0],
  10
  );
  await boardHandler.addPawnsToBoard(
  0,
  [0,1,2,4,5,6,7,0,0,0],
  [0,0,0,0,0,0,0,0,0,0],
  [1,2,3,4,3,2,1,0,0,0],
  7
  );
  await boardHandler.addPawnsToBoard(
  0,
  [0,1,2,3,4,5,6,7,0,0],
  [6,6,6,6,6,6,6,6,0,0],
  [6,6,6,6,6,6,6,6,0,0],
  8
  );
  await boardHandler.addPawnsToBoard(
  0,
  [0,1,2,4,5,6,7,0,0,0],
  [7,7,7,7,7,7,7,0,0,0],
  [7,8,9,10,9,8,7,0,0,0],
  7
  );

  // Deploy the board
  await boardHandler.deployBoard(0);

  // Start the first game
  await boardHandler.joinGame(0, {from: accounts[0]})
  await boardHandler.joinGame(0, {from: accounts[1]})
}

const deployLightBrigadeChessBoard = async (boardHandler, accounts) => {
  // Create the chess board and pawns
  await boardHandler.createBoard("Light Brigade Chess", ChessBoard.address);
  await boardHandler.addPawnTypeToBoard(1, WhitePawn.address);
  await boardHandler.addPawnTypeToBoard(1, WhiteRook.address);
  await boardHandler.addPawnTypeToBoard(1, WhiteKnight.address);
  await boardHandler.addPawnTypeToBoard(1, WhiteBishop.address);
  await boardHandler.addPawnTypeToBoard(1, WhiteQueen.address);
  await boardHandler.addPawnTypeToBoard(1, WhiteKing.address);
  await boardHandler.addPawnTypeToBoard(1, BlackPawn.address);
  await boardHandler.addPawnTypeToBoard(1, BlackRook.address);
  await boardHandler.addPawnTypeToBoard(1, BlackKnight.address);
  await boardHandler.addPawnTypeToBoard(1, BlackBishop.address);
  await boardHandler.addPawnTypeToBoard(1, BlackQueen.address);
  await boardHandler.addPawnTypeToBoard(1, BlackKing.address);

  // Place pawns on the chess board
  await boardHandler.addPawnsToBoard(
    1,
    [4,4,0,1,2,3,4,5,6,7],
    [7,0,6,6,6,6,6,6,6,6],
    [5,11,0,0,0,0,0,0,0,0],
    10
  );
  await boardHandler.addPawnsToBoard(
    1,
    [0,1,2,3,4,5,6,7,0,0],
    [1,1,1,1,1,1,1,1,0,0],
    [6,6,6,6,6,6,6,6,0,0],
    8
  );
  await boardHandler.addPawnsToBoard(
    1,
    [0,1,2,3,5,6,7,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [8,8,8,8,8,8,8,0,0,0],
    7
  );
  await boardHandler.addPawnsToBoard(
    1,
    [1,3,6,0,0,0,0,0,0,0],
    [7,7,7,0,0,0,0,0,0,0],
    [4,4,4,0,0,0,0,0,0,0],
    3
  );

  // Deploy the board
  await boardHandler.deployBoard(1);

  // Start the first game
  await boardHandler.joinGame(1, {from: accounts[0]})
  await boardHandler.joinGame(1, {from: accounts[1]})
}