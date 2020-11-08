// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.6.11;

import "../BoardEvents.sol";

contract NoEvents is BoardEvents {
    function gameFinished(uint boardId, uint gameId, address winner, address loser) external override {
        // No event occurs on finished games
        return;
    }

    function joinGame(uint boardId, uint gameId, address joiner) external override returns(bool) {
        // Player can always join a game
        return true;
    }
}