pragma solidity 0.5.12;

interface Board {
    function checkVictory(uint8 player, uint8[121] state) external view returns(bool);
}