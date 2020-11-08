// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.11;

/**
 * @title Board
 * @notice The interface that must implement board's smart contract, contains one function to check victory
*/
interface Board {
    /**
     * @notice Allow to retrieve the metadata of the board
     * @return the string a allows to retrieve metadata (e.g IPFS hash)
    */
    function getMetadata() external view returns (string memory);
    
    /**
     * @notice Check if the state of a game of the board is victorious for a player
     * @param player the player we want to check as victorious
     * @param state the state of the game
     * @return true if the player is victorious, false otherwise
    */
    function checkVictory(uint8 player, uint8[121] calldata state) external view returns(bool);
}