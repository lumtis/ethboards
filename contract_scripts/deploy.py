import web3
import json
from web3 import Web3, HTTPProvider
from time import sleep

# Test all real feature of nuja battle

web3 = Web3(HTTPProvider('http://localhost:8545'))



# Deploying TimeoutStarter
jsonData=open('../build/contracts/ServerManager.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000, 'gas': 6721975000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('ServerManager')
ServerManagerAddress = addr
print(addr)


# Deploying TimeoutStarter
jsonData=open('../build/contracts/TimeoutStarter.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000, 'gas': 6721975000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('TimeoutStarter')
TimeoutStarterAddress = addr
print(addr)

# Deploying TimeoutManager
jsonData=open('../build/contracts/TimeoutStopper.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000, 'gas': 6721975000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('TimeoutStopper')
TimeoutStopperAddress = addr
print(addr)


# Deploying NujaRegistry
jsonData=open('../build/contracts/NujaRegistry.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
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
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('CharacterRegistry')
CharacterRegistryAddress = addr
print(addr)

# Deploying WeaponRegistry
jsonData=open('../build/contracts/WeaponRegistry.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('WeaponRegistry')
WeaponRegistryAddress = addr
print(addr)


# Deploying NujaBattle
jsonData=open('../build/contracts/NujaBattle.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000, 'gas': 6721975000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('NujaBattle')
NujaBattleAddress = addr
print(addr)


# Setting registry for characterRegistry
jsonData=open('../build/contracts/CharacterRegistry.json').read()
data = json.loads(jsonData)
cr = web3.eth.contract(data['abi'], CharacterRegistryAddress)
tx_hash = cr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).changeNujaRegistry(NujaRegistryAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)

# Setting addresses for timeoutStarter
jsonData=open('../build/contracts/TimeoutStarter.json').read()
data = json.loads(jsonData)
tm = web3.eth.contract(data['abi'], TimeoutStarterAddress)
tx_hash = tm.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).setAddresses(NujaBattleAddress, TimeoutStopperAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)

# Setting addresses for timeoutManager
jsonData=open('../build/contracts/TimeoutStopper.json').read()
data = json.loads(jsonData)
tm = web3.eth.contract(data['abi'], TimeoutStopperAddress)
tx_hash = tm.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).setAddresses(NujaBattleAddress, TimeoutStarterAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)



# Deploying Nujas
jsonData=open('../build/contracts/Bearja.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Bearja')
BearjaAddress = addr
print(addr)
jsonData=open('../build/contracts/Bullja.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Bullja')
BulljaAddress = addr
print(addr)
jsonData=open('../build/contracts/FireNuja.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('FireNuja')
FireNujaAddress = addr
print(addr)
jsonData=open('../build/contracts/LeafNuja.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('LeafNuja')
LeafNujaAddress = addr
print(addr)
jsonData=open('../build/contracts/WaterNuja.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('WaterNuja')
WaterNujaAddress = addr
print(addr)

# Registering Nujas
jsonData=open('../build/contracts/NujaRegistry.json').read()
data = json.loads(jsonData)
nr = web3.eth.contract(data['abi'], NujaRegistryAddress)
tx_hash = nr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addNuja(LeafNujaAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addNuja(FireNujaAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addNuja(WaterNujaAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addNuja(BulljaAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addNuja(BearjaAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)

# Deploying Weapons
jsonData=open('../build/contracts/Grenade.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Grenade')
GrenadeAddress = addr
print(addr)
jsonData=open('../build/contracts/Hammer.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Hammer')
HammerAddress = addr
print(addr)
jsonData=open('../build/contracts/Jetpack.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Jetpack')
JetpackAddress = addr
print(addr)
jsonData=open('../build/contracts/Knife.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Knife')
KnifeAddress = addr
print(addr)
jsonData=open('../build/contracts/Pistol.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Pistol')
PistolAddress = addr
print(addr)
jsonData=open('../build/contracts/Sniper.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Sniper')
SniperAddress = addr
print(addr)
jsonData=open('../build/contracts/Sword.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000})
sleep(1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Sword')
SwordAddress = addr
print(addr)

# Registering Weapons
jsonData=open('../build/contracts/WeaponRegistry.json').read()
data = json.loads(jsonData)
wr = web3.eth.contract(data['abi'], WeaponRegistryAddress)
tx_hash = wr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addWeapon(GrenadeAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = wr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addWeapon(HammerAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = wr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addWeapon(JetpackAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = wr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addWeapon(KnifeAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = wr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addWeapon(PistolAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = wr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addWeapon(SniperAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = wr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addWeapon(SwordAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)




# Creating character
jsonData=open('../build/contracts/CharacterRegistry.json').read()
data = json.loads(jsonData)
cr = web3.eth.contract(data['abi'], CharacterRegistryAddress)
tx_hash = cr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addCharacter('Haiti', '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = cr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addCharacter('France', '0xaBD29D4A1FCCBC958Bff35F5D76661Ce6edbC69F', 4)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = cr.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addCharacter('France', '0xcb28d25F51D1649be26f6c98f6d8f8395ff0C6DB', 3)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)

jsonData=open('../build/contracts/ServerManager.json').read()
data = json.loads(jsonData)
sm = web3.eth.contract(data['abi'], ServerManagerAddress)

nineArray = [0,0,0,0,0,0,0,0,0]

tx_hash = sm.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000, 'value': 5000000000000000}).addServer('toast', 3, 0, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = sm.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).addBuildingToServer(0, [3]+nineArray, [3]+nineArray, [2]+nineArray, 1)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = sm.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000}).setServerOnline(0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = sm.transact(transaction={'from': '0xDf907B2794f0b6B2967d4035464edA116DDc2578', 'gasPrice': 2000000000, 'value': 5000000000000000}).addPlayerToServer(0, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = sm.transact(transaction={'from': '0xaBD29D4A1FCCBC958Bff35F5D76661Ce6edbC69F', 'gasPrice': 2000000000, 'value': 5000000000000000}).addPlayerToServer(1, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = sm.transact(transaction={'from': '0xcb28d25F51D1649be26f6c98f6d8f8395ff0C6DB', 'gasPrice': 2000000000, 'value': 5000000000000000}).addPlayerToServer(2, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = sm.transact(transaction={'from': '0xcb28d25F51D1649be26f6c98f6d8f8395ff0C6DB', 'gasPrice': 2000000000}).startServer(0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
