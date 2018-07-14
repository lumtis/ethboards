pragma solidity ^0.4.2;

import "../BattleUtils.sol";

contract Weapon {
    address constant battleUtils = address(0);

    // Must return ipfs hash
    // the repository must at least contain image.png and name/default
    function getMetadata() public pure returns (string metadata);

    // Function called by server to use the Weapon
    function use(uint8 x, uint8 y, uint8 player, uint[176] moveInput) public view returns(uint[176] moveOutput);
}
