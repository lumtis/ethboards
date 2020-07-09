pragma solidity 0.5.16;

/**
 * @title State controller
 * @notice Contain functions to control transition of the game state
*/
library StateController {

    /**
    * State observation utilitary function
    */

    /**
     * @notice Get the number of pawns in the game
     * @param state the state of the game
     * @return the number of pawn
    */
    function getPawnNumber(uint8[121] memory state) public pure returns (uint8) {
        return state[0];
    }

    /**
     * @notice Get the position of a specific pawn in the game
     * @param state the state of the game
     * @param pawn the index of the pawn
     * @return the coordinates (x,y) of the pawn
    */
    function getPawnPosition(uint8[121] memory state, uint8 pawn) public pure returns (uint8, uint8) {
        // Require the pawn exist
        require(pawn < state[0], "Pawn doesn't exist");
        require(state[1+pawn] > 0, "Pawn is dead");

        return (state[41+pawn], state[81+pawn]);
    }

    /**
     * @notice Get the type of a specific pawn in the game, the type is what defines the pawn (e.g allows to get the specific smart contract of the pawn)
     * @param state the state of the game
     * @param pawn the index of the pawn
     * @return the type of the pawn
    */
    function getPawnType(uint8[121] memory state, uint8 pawn) public pure returns (uint8) {
        // Require the pawn exist
        require(pawn < state[0], "Pawn doesn't exist");
        require(state[1+pawn] > 0, "Pawn is dead");

        return state[1+pawn]-1;
    }

    /**
     * @notice Determine if a specific pawn in the game is still alive
     * @param state the state of the game
     * @param pawn the index of the pawn
     * @return true if the pawn is still alive
    */
    function isAlive(uint8[121] memory state, uint8 pawn) public pure returns (bool) {
        // Require the pawn exist
        require(pawn < state[0], "Pawn doesn't exist");
        return state[1+pawn] > 0;
    }

    /**
     * @notice Get the pawn present in a specific location in the map
     * @param state the state of the game
     * @param x x coordinate
     * @param y y coordinate
     * @return the pawn index if a pawn is present, -1 if no pawn is present on this location
    */
    function getPawnAt(uint8[121] memory state, uint8 x, uint y) public pure returns (int8) {
        uint8 pawnNb = getPawnNumber(state);
        for (uint8 i = 0; i < pawnNb; i++) {
            if (state[1+i] > 0 && state[41+i] == x && state[81+i] == y) {
                return int8(i);
            }
        }

        return -1;
    }

    /**
     * @notice Check if a pawn is present on a specific location
     * @param state the state of the game
     * @param x x coordinate
     * @param y y coordinate
     * @return true if NO pawn is present, false otherwise
    */
    function noPawnAt(uint8[121] memory state, uint8 x, uint y)  public pure returns (bool) {
        return getPawnAt(state, x, y) == -1;
    }

    /**
    * State transition utilitary function
    */

    /**
     * @notice Perform the state transition when moving a pawn on the map
     * @param state the state of the game
     * @param pawn index of the pawn
     * @param x x coordinate where to move the pawn
     * @param y y coordinate where to move the pawn
     * @return the new state once the pawn has been moved
    */
    function movePawn(uint8[121] memory state, uint8 pawn, uint8 x, uint8 y) public pure returns (uint8[121] memory) {
        require(x < 8, "x out of bound");
        require(y < 8, "y out of bound");
        require(pawn < state[0], "Pawn doesn't exist");
        require(state[1+pawn] > 0, "Pawn is dead");
        require(getPawnAt(state, x, y) == -1, "A pawn is already present");

        state[41+pawn] = x;
        state[81+pawn] = y;

        return state;
    }

    /**
     * @notice Perform the state transition when removing a pawn from the game
     * @param state the state of the game
     * @param pawn index of the pawn
     * @return the new state once the pawn has been removed
    */
    function removePawn(uint8[121] memory state, uint8 pawn) public pure returns (uint8[121] memory) {
        require(pawn < state[0], "Pawn doesn't exist");
        require(state[1+pawn] > 0, "Pawn is dead");

        state[1+pawn] = 0;

        return state;
    }

    /**
     * @notice Perform the state transition when change the pawn type or revive a pawn in the game
     * @param state the state of the game
     * @param pawn index of the pawn
     * @param pawnType the type of the pawn to respawn
     * @param x x coordinate to respawn the pawn
     * @param y y coordinate to respawn the pawn
     * @return the new state once the pawn has been respawned
    */
    function respawnPawn(uint8[121] memory state, uint8 pawn, uint8 pawnType, uint8 x, uint8 y) public pure returns (uint8[121] memory) {
        require(x < 8, "x out of bound");
        require(y < 8, "y out of bound");
        require(pawn < state[0], "Pawn doesn't exist");
        require(state[1+pawn] == 0, "Pawn is still alive");
        require(getPawnAt(state, x, y) == -1, "A pawn is already present");

        state[1+pawn] = pawnType + 1;
        state[41+pawn] = x;
        state[81+pawn] = y;

        return state;
    }
}
