import web3
import json
from web3 import Web3, HTTPProvider

web3 = Web3(HTTPProvider('http://localhost:7545'))

### Initialisation
# Contract abi
jsonData=open('../build/contracts/CharacterRegistry.json').read()
data = json.loads(jsonData)

### Function calling
# Contract address
addr = '0x345cA3e014Aaf5dcA488057592ee47305D9B3e10'

# Get contract instance
cr = web3.eth.contract(data['abi'], addr)


print('character info: ')
print(cr.call().totalSupply())
