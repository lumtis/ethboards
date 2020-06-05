const EthBoards = artifacts.require("./EthBoards.sol");
const BoardHandler = artifacts.require("./BoardHandler.sol");
const StateController =  artifacts.require("./StateController.sol");
const ChessBoard =  artifacts.require("./Board/ChessBoard.sol");
const WhitePawn =  artifacts.require("./Board/WhitePawn.sol");
const BlackPawn =  artifacts.require("./Board/BlackPawn.sol");

module.exports = async (deployer) => {
  // Deploy libraries
  await deployer.deploy(StateController);
  deployer.link(StateController, EthBoards);
  deployer.link(StateController, ChessBoard);
  deployer.link(StateController, WhitePawn);
  deployer.link(StateController, BlackPawn);

  // Deploy contracts
  const ethBoards = await deployer.deploy(EthBoards);
  const boardHandler = await deployer.deploy(BoardHandler, ethBoards.address);

  // Deploy chess contracts
  const chessBoard = await deployer.deploy(ChessBoard);
  const whitePawn = await deployer.deploy(WhitePawn);
  const blackPawn = await deployer.deploy(BlackPawn);

  // Create the chess board and pawns
  await boardHandler.createBoard("Chess", chessBoard.address);
  await boardHandler.addPawnTypeToBoard(0, whitePawn.address);
  await boardHandler.addPawnTypeToBoard(0, blackPawn.address);

  // Place pawns on the chess board
  await boardHandler.addPawnsToBoard(
    0,
    [0,1,2,3,4,5,6,7,0,0],
    [1,1,1,1,1,1,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    8
  );
  await boardHandler.addPawnsToBoard(
    0,
    [0,1,2,3,4,5,6,7,0,0],
    [6,6,6,6,6,6,6,6,0,0],
    [1,1,1,1,1,1,1,1,0,0],
    8
  );
};
