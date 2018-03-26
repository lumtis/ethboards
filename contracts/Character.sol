pragma solidity ^0.4.2;

contract Character {

    string name;
    uint exp;
    uint8 health;
    uint8 attack;
    uint8 defense;

    function Character(string p_name) public {
        name = p_name;
        exp = 0;
        health = 100;
        attack = 1;
        defense = 0;
    }

}
