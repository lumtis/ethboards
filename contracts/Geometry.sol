pragma solidity ^0.4.2;

contract Geometry {
    function max(uint8 a, uint8 b) internal pure returns (uint8) {
        return a > b ? a : b;
    }
    function abs(int8 a) internal pure returns (uint8) {
        return a < 0 ? (uint8)(-a) : (uint8)(a);
    }
    function distance(uint8 x1, uint8 y1, uint8 x2, uint8 y2) internal pure returns (uint8) {
        return max(abs((int8)(x1-x2)), abs((int8)(y1-y2)));
    }
}
