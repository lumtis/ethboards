/**
Utils pure functions
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

contract BattleUtils {

    /////////////////////////////////////////////////////////////
    // Geometry functions

    function max(uint a, uint b) public pure returns (uint) {
        return a > b ? a : b;
    }
    function abs(int a) public pure returns (uint) {
        return a < 0 ? (uint)(-a) : (uint)(a);
    }
    function distance(uint x1, uint y1, uint x2, uint y2) public pure returns (uint) {
        return max(abs((int)(x1-x2)), abs((int)(y1-y2)));
    }

    /////////////////////////////////////////////////////////////
    // Battle functions

    function move(uint p, uint8 x, uint8 y, uint[176] moveInput) public pure returns (uint[176] moveOutput) {
        uint8 xInitial;
        uint8 yInitial;
        (xInitial, yInitial) = getPosition(moveInput, p);
        require(distance(x, y, xInitial, yInitial) == 1);

        return movePlayer(moveInput, p, x, y);
    }

    function attack(uint8 p, uint8 x, uint8 y, uint[176] moveInput) public pure returns (uint[176] moveOutput) {
        uint8 xInitial;
        uint8 yInitial;
        (xInitial, yInitial) = getPosition(moveInput, p);
        require(distance(x, y, xInitial, yInitial) == 1);

        uint opponent = getPlayer(moveInput, x, y);
        require(opponent > 0);
        opponent -= 1;

        return damage(moveInput, opponent, 100);
    }

    function exploreBuilding(uint8 p, uint[176] moveInput) public pure returns (uint[176] moveOutput) {
        uint8 xInitial;
        uint8 yInitial;
        (xInitial, yInitial) = getPosition(moveInput, p);
        uint buildingCode = getBuilding(moveInput, xInitial, yInitial);

        // Add the weapon
        require(buildingCode > 1);
        uint[176] memory tmp = addWeapon(moveInput, p, buildingCode-2);

        // Set building as explored
        return setBuilding(tmp, xInitial, yInitial, 1);
    }

    // Get address coming from a move signature
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

    /////////////////////////////////////////////////////////////
    // Functions to manage state

    // Building function
    function getBuilding(uint[176] state, uint8 x, uint8 y) public pure returns (uint ret) {
        return state[x*8+y];
    }
    function setBuilding(uint[176] state, uint8 x, uint8 y, uint code) public pure returns (uint[176] ret) {
        state[x*8+y] = code;
        return state;
    }

    // Position function
    function getPlayer(uint[176] state, uint8 x, uint8 y) public pure returns (uint ret) {
        return state[64+x*8+y];
    }
    function getPosition(uint[176] state, uint p) public pure returns (uint8 xret, uint8 yret) {
        return (uint8(state[136+p]), uint8(state[144+p]));
    }

    function movePlayer(uint[176] state, uint p, uint8 x, uint8 y) public pure returns (uint[176] ret) {
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
    function damage(uint[176] state, uint p, uint nb) public pure returns(uint[176] ret) {
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
    function restore(uint[176] state, uint p, uint nb) public pure returns(uint[176] ret) {
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
    function isAlive(uint[176] state, uint p) public pure returns (bool ret) {
        return state[128+p] > 0;
    }

    // Not public because necessary for timeoutManager
    function kill(uint[176] state, uint p) public pure returns (uint[176] ret) {
        state[128+p] = 0;

        // Set the position of the player to 0
        uint8 x = uint8(state[136+p]);
        uint8 y = uint8(state[144+p]);

        state[64+x*8+y] = 0;

        return state;
    }


    // Weapon function

    function getWeaponNb(uint[176] state, uint p) public pure returns (uint8 ret) {
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
    function getWeapon(uint[176] state, uint p, uint8 index) public pure returns (uint ret) {
        require(index < 3);
        require(state[152+p+index*8] > 0);
        return state[152+p+index*8] - 1;
    }
    function addWeapon(uint[176] state, uint p, uint w) public pure returns (uint[176] ret) {
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
    function removeWeapon(uint[176] state, uint p, uint8 index) public pure returns (uint[176] ret) {
        require(index < 3);
        state[152+p+index*8] = 0;

        // Other weapon reindexation
        for(uint8 i=index+1; i<3; i++) {
            state[152+p+(i-1)*8] = state[152+p+i*8];
        }

        return state;
    }
}
