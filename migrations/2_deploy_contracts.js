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
  const chessBoard = await deployer.deploy(ChessBoard);
  const whitePawn = await deployer.deploy(WhitePawn);
  const whiteRook = await deployer.deploy(WhiteRook);
  const whiteKnight = await deployer.deploy(WhiteKnight);
  const whiteBishop = await deployer.deploy(WhiteBishop);
  const whiteQueen = await deployer.deploy(WhiteQueen);
  const whiteKing = await deployer.deploy(WhiteKing);
  const blackPawn = await deployer.deploy(BlackPawn);
  const blackRook = await deployer.deploy(BlackRook);
  const blackKnight = await deployer.deploy(BlackKnight);
  const blackBishop = await deployer.deploy(BlackBishop);
  const blackQueen = await deployer.deploy(BlackQueen);
  const blackKing = await deployer.deploy(BlackKing);

  // Create the chess board and pawns
  await boardHandler.createBoard("Chess", chessBoard.address);
  await boardHandler.addPawnTypeToBoard(0, whitePawn.address);
  await boardHandler.addPawnTypeToBoard(0, whiteRook.address);
  await boardHandler.addPawnTypeToBoard(0, whiteKnight.address);
  await boardHandler.addPawnTypeToBoard(0, whiteBishop.address);
  await boardHandler.addPawnTypeToBoard(0, whiteQueen.address);
  await boardHandler.addPawnTypeToBoard(0, whiteKing.address);
  await boardHandler.addPawnTypeToBoard(0, blackPawn.address);
  await boardHandler.addPawnTypeToBoard(0, blackRook.address);
  await boardHandler.addPawnTypeToBoard(0, blackKnight.address);
  await boardHandler.addPawnTypeToBoard(0, blackBishop.address);
  await boardHandler.addPawnTypeToBoard(0, blackQueen.address);
  await boardHandler.addPawnTypeToBoard(0, blackKing.address);

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
    [0,1,2,4,6,7,0,0,0],
    [0,0,0,0,0,0,0,0,0],
    [1,2,3,4,2,1,0,0,0],
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
};
