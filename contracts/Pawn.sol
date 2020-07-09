pragma solidity 0.5.16;

/**
 * @title Pawn
 * @notice The interface that must implement pawn's smart contract, the functions describe the pawn behavior and metadata
*/
interface Pawn {
    /**
     * @notice Allow to retrieve the metadata of the pawn
     * @return the string a allows to retrieve metadata (e.g IPFS hash)
    */
    function getMetadata() external view returns (string memory);

    /**
     * @notice Retrieve the number of moves implemented by the pawn
     * @return the number of available moves
    */
    function getMoveNumber() external pure returns(uint8);

    /**
     * @notice Perform the state transition when performing a move of the pawn
     * @param player the player that perform the move (0 or 1)
     * @param pawn the index of the pawn that perform the move
     * @param moveType the specific move that the player wants to perform
     * @param x x coordinate to perform the move into
     * @param y y coordinate to perform the move into
     * @param state the state of the game
     * @return the new state once the move has been performed, reverted if the move is not possible
    */
    function performMove(
        uint8 player,
        uint8 pawn,
        uint8 moveType,
        uint8 x,
        uint8 y,
        uint8[121] calldata state
    ) external pure returns(uint8[121] memory);
}