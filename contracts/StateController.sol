pragma solidity 0.5.16;

/*
State:
uint8[1] nbPawn,
uint8[40] pawnId,
uint8[40] xPosistion,
uint8[40] yPosisiton,
*/

/*
Move
uint8 pawn
uint8 type
uint8 x
uint8 y
*/

/**
 * @title State controller
 * @author Lucas Bertrand
 * @notice Contain function to control transition of the state
*/
library StateController {

    // Get from a turn set (nonce, move, input state) the owner of the turn
    function turnOwner(
      uint8[121] memory state,
      uint[3] memory nonce,
      uint8[4] memory move,
      bytes32 r,
      bytes32 s,
      uint8 v
      ) public pure returns (address recovered) {

        // Convert to uint for keccak256 function
        uint[61] memory inStateUint;
        for(uint8 i = 0; i < 121; i++) {
          inStateUint[i] = uint(state[i]);
        }

        // Calculate the hash of the move
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 message = keccak256(abi.encodePacked(prefix, keccak256(abi.encodePacked(nonce, move, inStateUint))));

        return ecrecover(message, v, r, s);
    }

    /**
    * State observation utilitary function
    */

    // Get the initial number of pawn
    function getPawnNumber(uint8[121] memory state) public pure returns (uint8) {
        return state[0];
    }

    // Get the position of a specific pawn
    function getPawnPosition(uint8[121] memory state, uint8 pawn) public pure returns (uint8, uint8) {
        // Require the pawn exist
        require(pawn < state[0], "Pawn doesn't exist");
        require(state[1+pawn] > 0, "Pawn is dead");

        return (state[41+pawn], state[81+pawn]);
    }

    // Get the type of the pawn
    function getPawnType(uint8[121] memory state, uint8 pawn) public pure returns (uint8) {
        // Require the pawn exist
        require(pawn < state[0], "Pawn doesn't exist");
        require(state[1+pawn] > 0, "Pawn is dead");

        return state[1+pawn]-1;
    }

    function isAlive(uint8[121] memory state, uint8 pawn) public pure returns (bool) {
        // Require the pawn exist
        require(pawn < state[0], "Pawn doesn't exist");
        return state[1+pawn] > 0;
    }

    // Get the pawn id in a position
    function getPawnAt(uint8[121] memory state, uint8 x, uint y) public pure returns (int8) {
        uint8 pawnNb = getPawnNumber(state);
        for (uint8 i = 0; i < pawnNb; i++) {
            if (state[1+i] > 0 && state[41+i] == x && state[81+i] == y) {
                return int8(i);
            }
        }

        return -1;
    }

    function noPawnAt(uint8[121] memory state, uint8 x, uint y)  public pure returns (bool) {
        return getPawnAt(state, x, y) == -1;
    }

    /**
    * State transition utilitary function
    */

    // Move a pawn
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

    // Remove a pawn
    function removePawn(uint8[121] memory state, uint8 pawn) public pure returns (uint8[121] memory) {
        require(pawn < state[0], "Pawn doesn't exist");
        require(state[1+pawn] > 0, "Pawn is dead");

        state[1+pawn] = 0;

        return state;
    }

    // Respawn a pawn
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
