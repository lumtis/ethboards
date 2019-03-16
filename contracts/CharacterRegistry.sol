pragma solidity ^0.4.2;

import "NujaRegistry.sol";
import "ERC721.sol";

contract CharacterRegistry is ERC721 {

    ///////////////////////////////////////////////////////////////
    /// Modifiers

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }


    ///////////////////////////////////////////////////////////////
    /// Structures

    struct Character {
        string nickname;
        address owner;
        uint nuja;
        uint indexUser;
    }

    struct SellOrder {
        address seller;
        uint token;
        uint price;
    }

    ///////////////////////////////////////////////////////////////
    /// Constants

    string constant NAME = "NujaToken";
    string constant SYMBOL = "NJT";

    ///////////////////////////////////////////////////////////////
    /// Attributes

    address nujaRegistry;
    address owner;
    uint characterNumber;
    Character[] characterArray;
    mapping (address => uint256) characterCount;
    mapping (uint256 => address) approveMap;
    SellOrder[] sellOrderList;

    // Index of the card for the user
    mapping (address => mapping (uint => uint)) indexCharacter;

    mapping (address => bool) starterClaimed;

    ///////////////////////////////////////////////////////////////
    /// Constructor

    function CharacterRegistry() public {
        nujaRegistry = 0x796826c8adEB80A5091CEe9199D551ccB0bd3f18;
        owner = msg.sender;
        characterNumber = 0;
    }

    ///////////////////////////////////////////////////////////////
    /// Admin functions

    function addCharacter(string nickname, address characterOwner, uint nuja) public onlyOwner {
        NujaRegistry reg = NujaRegistry(nujaRegistry);
        require(nuja < reg.getNujaNumber());

        Character memory c = Character(nickname, characterOwner, nuja, characterCount[characterOwner]);
        characterArray.push(c);

        indexCharacter[characterOwner][characterCount[characterOwner]] = characterNumber;
        characterCount[characterOwner] += 1;
        characterNumber += 1;
    }


    function claimStarter(string nickname, uint nuja) public {
        require(starterClaimed[msg.sender] == false);
        require(nuja < 3);

        Character memory c = Character(nickname, msg.sender, nuja, characterCount[msg.sender]);
        characterArray.push(c);

        indexCharacter[msg.sender][characterCount[msg.sender]] = characterNumber;
        characterCount[msg.sender] += 1;
        characterNumber += 1;

        starterClaimed[msg.sender] = true;
    }

    function isStarterClaimed(address user) public view returns(bool starterClaimedRet) {
        return starterClaimed[user];
    }

    ///////////////////////////////////////////////////////////////
    /// Implementation ERC721

    function isERC721() public pure returns (bool b) {
        return true;
    }

    function implementsERC721() public pure returns (bool b) {
        return true;
    }

    function name() public pure returns (string _name) {
        return NAME;
    }

    function symbol() public pure returns (string _symbol) {
        return SYMBOL;
    }

    function totalSupply() public view returns (uint256 _totalSupply) {
        return characterNumber;
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return characterCount[_owner];
    }

    function ownerOf(uint256 _tokenId) public view returns (address _owner) {
        require(_tokenId < characterNumber);
        Character memory c = characterArray[_tokenId];
        return c.owner;
    }

    function approve(address _to, uint256 _tokenId) public {
        require(msg.sender == ownerOf(_tokenId));
        require(msg.sender != _to);

        approveMap[_tokenId] = _to;
        Approval(msg.sender, _to, _tokenId);
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) public {
        require(_tokenId < characterNumber);
        require(_from == ownerOf(_tokenId));
        require(_from != _to);
        require(approveMap[_tokenId] == _to);

        characterCount[_from] -= 1;

        // Change the indexCharacter of _from
        indexCharacter[_from][characterArray[_tokenId].indexUser] = indexCharacter[_from][characterCount[_from]];
        characterArray[indexCharacter[_from][characterCount[_from]]].indexUser = characterArray[_tokenId].indexUser;

        // This card is the last one for the new owner
        characterArray[_tokenId].indexUser = characterCount[_to];
        indexCharacter[_to][characterCount[_to]] = _tokenId;

        characterArray[_tokenId].owner = _to;
        characterCount[_to] += 1;
        Transfer(_from, _to, _tokenId);
    }

    function takeOwnership(uint256 _tokenId) public {
        require(_tokenId < characterNumber);
        address oldOwner = ownerOf(_tokenId);
        address newOwner = msg.sender;
        require(newOwner != oldOwner);
        require(approveMap[_tokenId] == msg.sender);

        characterCount[oldOwner] -= 1;

        // Change the indexCharacter of _from
        indexCharacter[oldOwner][characterArray[_tokenId].indexUser] = indexCharacter[oldOwner][characterCount[oldOwner]];
        characterArray[indexCharacter[oldOwner][characterCount[oldOwner]]].indexUser = characterArray[_tokenId].indexUser;

        // This card is the last one for the new owner
        characterArray[_tokenId].indexUser = characterCount[newOwner];
        indexCharacter[newOwner][characterCount[newOwner]] = _tokenId;

        characterArray[_tokenId].owner = newOwner;
        characterCount[newOwner] += 1;
        Transfer(oldOwner, newOwner, _tokenId);
    }

    function transfer(address _to, uint256 _tokenId) public {
        require(_tokenId < characterNumber);
        address oldOwner = msg.sender;
        address newOwner = _to;
        require(oldOwner == ownerOf(_tokenId));
        require(oldOwner != newOwner);
        require(newOwner != address(0));

        characterCount[oldOwner] -= 1;

        // Change the indexCharacter of _from
        indexCharacter[oldOwner][characterArray[_tokenId].indexUser] = indexCharacter[oldOwner][characterCount[oldOwner]];
        characterArray[indexCharacter[oldOwner][characterCount[oldOwner]]].indexUser = characterArray[_tokenId].indexUser;

        // This card is the last one for the new owner
        characterArray[_tokenId].indexUser = characterCount[newOwner];
        indexCharacter[newOwner][characterCount[newOwner]] = _tokenId;

        characterArray[_tokenId].owner = newOwner;
        characterCount[newOwner] += 1;
        Transfer(oldOwner, newOwner, _tokenId);
    }

    function tokenOfOwnerByIndex(address _owner, uint256 _index) public constant returns (uint tokenId) {
        require(_index < characterCount[_owner]);

        return indexCharacter[_owner][_index];
    }


    // For this case the only metadata is the name of the human
    // TODO: implement this function with 2 byte32 arrays
    function tokenMetadata(uint256 _tokenId) public constant returns (string infoUrl) {
        require(_tokenId < characterNumber);
        return "nothing";//TODO
    }


    // Sale functions
    function createSellOrder(uint256 _tokenId, uint price) public {
        require(_tokenId < characterNumber);
        require(msg.sender == ownerOf(_tokenId));

        SellOrder memory newOrder = SellOrder(msg.sender, _tokenId, price);
        sellOrderList.push(newOrder);

        characterArray[_tokenId].owner = address(0);
        characterCount[msg.sender] -= 1;

        // Change the indexCharacter of sender
        indexCharacter[msg.sender][characterArray[_tokenId].indexUser] = indexCharacter[msg.sender][characterCount[msg.sender]];
        characterArray[indexCharacter[msg.sender][characterCount[msg.sender]]].indexUser = characterArray[_tokenId].indexUser;
    }

    function processSellOrder(uint id, uint256 _tokenId) payable public {
        require(id < sellOrderList.length);

        SellOrder memory order = sellOrderList[id];
        require(order.token == _tokenId);
        require(msg.value == order.price);
        require(msg.sender != order.seller);

        // Sending fund to the seller
        if(!order.seller.send(msg.value)) {
           revert();
        }

        // Adding token to the buyer
        characterArray[_tokenId].owner = msg.sender;

        // This token is the last one for the new owner
        characterArray[_tokenId].indexUser = characterCount[msg.sender];
        indexCharacter[msg.sender][characterCount[msg.sender]] = _tokenId;

        characterCount[msg.sender] += 1;

        // Update list
        sellOrderList[id] = sellOrderList[sellOrderList.length-1];
        delete sellOrderList[sellOrderList.length-1];
        sellOrderList.length--;
    }

    function cancelSellOrder(uint id, uint256 _tokenId) public {
        require(id < sellOrderList.length);

        SellOrder memory order = sellOrderList[id];
        require(order.seller == msg.sender);
        require(order.token == _tokenId);

        // Give back token to seller
        characterArray[_tokenId].owner = msg.sender;

        // This card is the last one for the new owner
        characterArray[_tokenId].indexUser = characterCount[msg.sender];
        indexCharacter[msg.sender][characterCount[msg.sender]] = _tokenId;

        characterCount[msg.sender] += 1;

        // Update list
        sellOrderList[id] = sellOrderList[sellOrderList.length-1];
        delete sellOrderList[sellOrderList.length-1];
        sellOrderList.length--;
    }

    function getSellOrder(uint id) public view returns(address sellerRet, uint tokenRet, uint priceRet) {
        require(id < sellOrderList.length);

        SellOrder memory ret = sellOrderList[id];
        return(ret.seller, ret.token, ret.price);
    }

    function getNbSellOrder() public view returns(uint nb) {
        return sellOrderList.length;
    }

    function getCharacterInfo(uint _tokenId) public view returns(string nicknameRet, address ownerRet) {
        require(_tokenId < characterNumber);

        Character memory ret = characterArray[_tokenId];
        return(ret.nickname, ret.owner);
    }

    function getCharacterNuja(uint _tokenId) public view returns(uint nujaRet) {
        require(_tokenId < characterNumber);

        Character memory ret = characterArray[_tokenId];
        return(ret.nuja);
    }

    // Get functions
    function getOwner() public view returns(address ret) {
        return owner;
    }
    function getNujaRegistry() public view returns(address ret) {
        return nujaRegistry;
    }
}
