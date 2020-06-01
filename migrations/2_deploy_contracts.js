const TokenClash = artifacts.require("./TokenClash.sol");
const BoardHandler = artifacts.require("./BoardHandler.sol");
const StateController =  artifacts.require("./StateController.sol");
const ChessBoard =  artifacts.require("./Board/ChessBoard.sol");
const WhitePawn =  artifacts.require("./Board/WhitePawn.sol");
const BlackPawn =  artifacts.require("./Board/BlackPawn.sol");

module.exports = async (deployer) => {
  // Deploy libraries
  await deployer.deploy(StateController);
  deployer.link(StateController, TokenClash);
  deployer.link(StateController, ChessBoard);
  deployer.link(StateController, WhitePawn);
  deployer.link(StateController, BlackPawn);

  // Deploy contracts
  const tokenClash = await deployer.deploy(TokenClash);
  const boardHandler = await deployer.deploy(BoardHandler, tokenClash.address);

  // Deploy chess contracts
  const chessBoard = await deployer.deploy(ChessBoard);
  const whitePawn = await deployer.deploy(WhitePawn);
  const blackPawn = await deployer.deploy(BlackPawn);

  // Create the chess board
  await boardHandler.createBoard("Chess", chessBoard.address);
  await boardHandler.addPawnTypeToBoard(0, whitePawn.address);
  await boardHandler.addPawnTypeToBoard(0, blackPawn.address);
};
