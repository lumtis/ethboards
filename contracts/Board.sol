pragma solidity 0.5.16;

interface Board {
    function checkVictory(uint8 player, uint8[121] calldata state) external view returns(bool);
}