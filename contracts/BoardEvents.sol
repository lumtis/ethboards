// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.11;

/**
 * @title BoardEvents
 * @notice The interface that must implement board events contract, actions that happen when a player win or lose a game and condition to join a game
*/
interface BoardEvents {
    /**
     * @notice Callback function called when the game is finished. It could for example distribute deposits to the winner
     * @param boardId id of the board
     * @param gameId id of the game
     * @param winner address of the winner
     * @param loser address of the loser
    */
    function gameFinished(uint boardId, uint gameId, address winner, address loser) external;

    /**
     * @notice Check if the player can join the game. It could be for example a function that verify the player has ade a deposit in the BoardEvents contract. This call shoud lock the fund until the game is finished
     * @param boardId id of the board
     * @param gameId id of the game
     * @param joiner address of the joining player
     * @return true if the player the caller can join the specified game
    */
    function joinGame(uint boardId, uint gameId, address joiner) external returns(bool);
}