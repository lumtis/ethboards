import web3
import json
from web3 import Web3, HTTPProvider


b_local = True

if b_local:
    web3 = Web3(HTTPProvider('http://localhost:7545'))
else:
    web3 = Web3(HTTPProvider('http://humanity.cards:8545'))

### Initialisation
# Contract abi
jsonData=open('../build/contracts/NujaBattle.json').read()
data = json.loads(jsonData)

### Deployment
contract = web3.eth.contract(abi=data['abi'], bytecode=data['bytecode'])
tx_hash = contract.deploy(transaction={'from': '0x627306090abaB3A6e1400e9345bC60c78a8BEf57', 'gasPrice': 2000000000})
tx_receipt = web3.eth.getTransactionReceipt(tx_hash)
addr = tx_receipt['contractAddress']

print(addr)
