pragma solidity 0.5.16;

/**
 * @title Board
 * @notice The interface that must implement board's smart contract, contains one function to check victory
 * TODO: Add function to retrieve metadata
*/
interface Board {
    /**
     * @notice Check if the state of a game of the board is victorious for a player
     * @param player the player we want to check as victorious
     * @param state the state of the game
     * @return true if the player is victorious, false otherwise
    */
    function checkVictory(uint8 player, uint8[121] calldata state) external view returns(bool);
}