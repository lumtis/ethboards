import web3
import json
from web3 import Web3, HTTPProvider

web3 = Web3(HTTPProvider('http://localhost:7545'))


NujaBattleAddress = '0x8CdaF0CD259887258Bc13a92C0a6dA92698644C0'
NujaRegistryAddress = '0xF12b5dd4EAD5F743C6BaA640B0216200e89B60Da'
CharacterRegistryAddress = '0x345cA3e014Aaf5dcA488057592ee47305D9B3e10'

BearjakAddress = '0x2C2B9C9a4a25e24B174f26114e8926a9f2128FE4'
BulljakAddress = '0x30753E4A8aad7F8597332E813735Def5dD395028'
FireNujakAddress = '0xFB88dE099e13c3ED21F80a7a1E49f8CAEcF10df6'
LeafNujakAddress = '0xAa588d3737B611baFD7bD713445b314BD453a5C8'
PinkNujakAddress = '0xf204a4Ef082f5c04bB89F7D5E6568B796096735a'
WaterNujakAddress = '0x75c35C980C0d37ef46DF04d31A140b65503c0eEd'
WhiteNujakAddress = '0x82D50AD3C1091866E258Fd0f1a7cC9674609D254'

JetpackAddress = '0x13274Fe19C0178208bCbee397af8167A7be27f6f'


# Deploying NujaBattle
jsonData=open('../build/contracts/NujaBattle.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('NujaBattle')
print(addr)

# Deploying NujaRegistry
jsonData=open('../build/contracts/NujaRegistry.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('NujaRegistry')
print(addr)

# Deploying CharacterRegistry
jsonData=open('../build/contracts/CharacterRegistry.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('CharacterRegistry')
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
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Bearjak')
print(addr)
jsonData=open('../build/contracts/Bulljak.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Bulljak')
print(addr)
jsonData=open('../build/contracts/FireNujak.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('FireNujak')
print(addr)
jsonData=open('../build/contracts/LeafNujak.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('LeafNujak')
print(addr)
jsonData=open('../build/contracts/PinkNujak.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('PinkNujak')
print(addr)
jsonData=open('../build/contracts/WaterNujak.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('WaterNujak')
print(addr)
jsonData=open('../build/contracts/WhiteNujak.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('WhiteNujak')
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
tx_hash = nr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addNuja(PinkNujakAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addNuja(WaterNujakAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addNuja(WhiteNujakAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)

# Deploying Weapons
jsonData=open('../build/contracts/Jetpack.json').read()
data = json.loads(jsonData)
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']
print('Jetpack')
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
tx_hash = cr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addCharacter('Uman', '0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e', 5)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = cr.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addCharacter('Chong', '0x2191eF87E392377ec08E7c08Eb105Ef5448eCED5', 6)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)

# Creating one server
jsonData=open('../build/contracts/NujaBattle.json').read()
data = json.loads(jsonData)
nb = web3.eth.contract(data['abi'], NujaBattleAddress)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000, 'gas': 40000000}).addServer('New York city')
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addPlayerToServer(0, 0)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addWeaponToServer(0, JetpackAddress)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addBuildingToServer(0, 2, 2)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
tx_hash = nb.transact(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000}).addBuildingToServer(0, 7, 7)
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
