import web3
import json
from web3 import Web3, HTTPProvider
from time import sleep

# Test one player for object and etc

web3 = Web3(HTTPProvider('http://localhost:7545'))

# Deploying NujaBattle
jsonData=open('../build/contracts/NujaBattle.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('NujaBattle')
NujaBattleAddress = addr
print(addr)

# Deploying NujaRegistry
jsonData=open('../build/contracts/NujaRegistry.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
NujaRegistryAddress = addr
print('NujaRegistry')
print(addr)

# Deploying CharacterRegistry
jsonData=open('../build/contracts/CharacterRegistry.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('CharacterRegistry')
CharacterRegistryAddress = addr
print(addr)

# Setting registry for characterRegistry
jsonData=open('../build/contracts/CharacterRegistry.json').read()
data = json.loads(jsonData)
cr = web3.eth.contract(data['abi'], CharacterRegistryAddress)
tx_hash = cr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).changeNujaRegistry(NujaRegistryAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = cr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).changeServerRegistry(NujaBattleAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)

# Setting registry for NujaBattle
jsonData=open('../build/contracts/NujaBattle.json').read()
data = json.loads(jsonData)
nb = web3.eth.contract(data['abi'], NujaBattleAddress)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).changeCharacterRegistry(CharacterRegistryAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)


# Deploying Nujas
jsonData=open('../build/contracts/Bearjak.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Bearjak')
BearjakAddress = addr
print(addr)
jsonData=open('../build/contracts/Bulljak.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Bulljak')
BulljakAddress = addr
print(addr)
jsonData=open('../build/contracts/FireNujak.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('FireNujak')
FireNujakAddress = addr
print(addr)
jsonData=open('../build/contracts/LeafNujak.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('LeafNujak')
LeafNujakAddress = addr
print(addr)
jsonData=open('../build/contracts/WaterNujak.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('WaterNujak')
WaterNujakAddress = addr
print(addr)

# Registering Nujas
jsonData=open('../build/contracts/NujaRegistry.json').read()
data = json.loads(jsonData)
nr = web3.eth.contract(data['abi'], NujaRegistryAddress)
tx_hash = nr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addNuja(BulljakAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addNuja(BearjakAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addNuja(FireNujakAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addNuja(LeafNujakAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addNuja(WaterNujakAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)

# Deploying Weapons
jsonData=open('../build/contracts/Grenade.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Grenade')
GrenadeAddress = addr
print(addr)
jsonData=open('../build/contracts/Hammer.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Hammer')
HammerAddress = addr
print(addr)
jsonData=open('../build/contracts/Jetpack.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Jetpack')
JetpackAddress = addr
print(addr)
jsonData=open('../build/contracts/Knife.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Knife')
KnifeAddress = addr
print(addr)
jsonData=open('../build/contracts/Pistol.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Pistol')
PistolAddress = addr
print(addr)
jsonData=open('../build/contracts/Sniper.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Sniper')
SniperAddress = addr
print(addr)
jsonData=open('../build/contracts/Sword.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Sword')
SwordAddress = addr
print(addr)


# Creating character
jsonData=open('../build/contracts/CharacterRegistry.json').read()
data = json.loads(jsonData)
cr = web3.eth.contract(data['abi'], CharacterRegistryAddress)
tx_hash = cr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addCharacter('Haiti', '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = cr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addCharacter('France', '0xf17f52151EbEF6C7334FAD080c5704D77216b732', 1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = cr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addCharacter('Elon', '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef', 2)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = cr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addCharacter('Luci', '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544', 3)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = cr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addCharacter('Captain', '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2', 4)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)


# Creating one server
jsonData=open('../build/contracts/NujaBattle.json').read()
data = json.loads(jsonData)
nb = web3.eth.contract(data['abi'], NujaBattleAddress)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000, 'gas': 67219750}).addServer('New York city')
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addBuildingToServer(0, 0, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addBuildingToServer(0, 1, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addBuildingToServer(0, 0, 1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addBuildingToServer(0, 1, 1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)



tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addWeaponToServer(0, GrenadeAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addWeaponToServer(0, HammerAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addWeaponToServer(0, JetpackAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addWeaponToServer(0, KnifeAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addWeaponToServer(0, PistolAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addWeaponToServer(0, SniperAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addWeaponToServer(0, SwordAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)


# Adding character
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addPlayerToServer(0, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0xf17f52151EbEF6C7334FAD080c5704D77216b732', 'gasPrice': 2000000000}).addPlayerToServer(1, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef', 'gasPrice': 2000000000}).addPlayerToServer(2, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x821aEa9a577a9b44299B9c15c88cf3087F3b5544', 'gasPrice': 2000000000}).addPlayerToServer(3, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x0d1d4e623D10F9FBA5Db95830F7d3839406C6AF2', 'gasPrice': 2000000000}).addPlayerToServer(4, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
