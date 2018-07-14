pragma solidity ^0.4.2;

import "../BattleUtils.sol";


contract Nuja is Geometry, StateManager {
    address constant battleUtils = address(0);

    function getMetadata() public constant returns (string metadata);

    // Function called by server to use the Weapon
    function power(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput);
}
