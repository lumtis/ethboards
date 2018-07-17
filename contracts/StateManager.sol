/**
Implements useful functions to get information from the state array
**/

/*
State:
uint[64] buildings
uint[64] characters,
uint[8] healths,
uint[8] xPositions,
uint[8] yPositions,
uint[8] weapon1,
uint[8] weapon2,
uint[8] weapon3
*/

contract StateManager {

    function moveOwner(
      uint[3] metadata,
      uint[4] move,
      uint[176] moveOutput,
      bytes32 r,
      bytes32 s,
      uint8 v
      ) public pure returns (address recovered) {

        // Calculate the hash of the move
        bytes32 hashedMove = keccak256(metadata, move, moveOutput);

        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 msg = keccak256(prefix, hashedMove);

        return ecrecover(msg, v, r, s);
    }


    // Building function
    function getBuilding(uint[176] state, uint8 x, uint8 y) internal pure returns (uint ret) {
        return state[x*8+y];
    }
    function setBuilding(uint[176] state, uint8 x, uint8 y, uint code) internal pure returns (uint[176] ret) {
        state[x*8+y] = code;
        return state;
    }

    // Position function
    function getPlayer(uint[176] state, uint8 x, uint8 y) internal pure returns (uint ret) {
        return state[64+x*8+y];
    }
    function getPosition(uint[176] state, uint p) internal pure returns (uint8 xret, uint8 yret) {
        return (uint8(state[136+p]), uint8(state[144+p]));
    }

    function movePlayer(uint[176] state, uint p, uint8 x, uint8 y) internal pure returns (uint[176] ret) {
      uint8 oldX = uint8(state[136+p]);
      uint8 oldY = uint8(state[144+p]);

      // Put player in the new position
      require(state[64+x*8+y] == 0);
      state[64+x*8+y] = p + 1;
      state[136+p] = x;
      state[144+p] = y;

      // Remove player from old position
      state[64+oldX*8+oldY] = 0;
      return state;
    }

    // Health function
    function getHealth(uint[176] state, uint p) public pure returns (uint ret) {
        return state[128+p];
    }
    function damage(uint[176] state, uint p, uint nb) internal pure returns(uint[176] ret) {
        require(nb <= 100);
        uint remaining = state[128+p];

        if(remaining <= nb) {
            state = kill(state, p);
        }
        else {
            state[128+p] = remaining - nb;
        }

        return state;
    }
    function restore(uint[176] state, uint p, uint nb) internal pure returns(uint[176] ret) {
        require(nb <= 100);
        uint remaining = state[128+p];

        if(remaining + nb > 100) {
            state[128+p] = 100;
        }
        else {
            state[128+p] = remaining + nb;
        }

        return state;
    }
    function isAlive(uint[176] state, uint p) internal pure returns (bool ret) {
        return state[128+p] > 0;
    }

    // Not internal because necessary for timeoutManager
    function kill(uint[176] state, uint p) public pure returns (uint[176] ret) {
        state[128+p] = 0;

        // Set the position of the player to 0
        uint8 x = uint8(state[136+p]);
        uint8 y = uint8(state[144+p]);

        state[64+x*8+y] = 0;

        return state;
    }


    // Weapon function

    function getWeaponNb(uint[176] state, uint p) internal pure returns (uint8 ret) {
        if(state[152+p] == 0) {
            return 0;
        }
        else if(state[160+p] == 0) {
            return 1;
        }
        else if(state[168+p] == 0) {
            return 2;
        }
        else {
            return 3;
        }
    }
    function getWeapon(uint[176] state, uint p, uint8 index) internal pure returns (uint ret) {
        require(index < 3);
        require(state[152+p+index*8] > 0);
        return state[152+p+index*8] - 1;
    }
    function addWeapon(uint[176] state, uint p, uint w) internal pure returns (uint[176] ret) {
        if(state[152+p] == 0) {
            state[152+p] = w+1;
        }
        else if(state[160+p] == 0) {
            state[160+p] = w+1;
        }
        else if(state[168+p] == 0) {
            state[168+p] = w+1;
        }
        else {
            revert();
        }
        return state;
    }
    function removeWeapon(uint[176] state, uint p, uint8 index) internal pure returns (uint[176] ret) {
        require(index < 3);
        state[152+p+index*8] = 0;

        // Other weapon reindexation
        for(uint8 i=index+1; i<3; i++) {
            state[152+p+(i-1)*8] = state[152+p+i*8];
        }

        return state;
    }
}
