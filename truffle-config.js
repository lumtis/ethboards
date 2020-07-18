require('dotenv').config()

const HDWalletProvider = require("@truffle/hdwallet-provider");
const rinkebyMnemonic = process.env.RINKEBY_HOTWALLET;
const infuraUrl = "https://rinkeby.infura.io/v3/" + process.env.INFURA_KEY;

module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 4712388,
      gasPrice: 2000000000,
      from: '0x49a1FE8F759aa7F738E8eDe3d10E8601F76a113c'
    },
    rinkeby: {
      provider: () => {
        return new HDWalletProvider(rinkebyMnemonic, infuraUrl)
      },
      host: infuraUrl,
      port: 443,
      from: "0xE789F255C2FD5Cb0B6f83Ce19a5cEfC972C5B022",
      network_id: 4,
      // gas: 4712388,
      // gasPrice: 2000000000
    }
  },
  compilers: {
    solc: {
      version: "0.6.11",
    },
  },
  plugins: [
    "@chainsafe/truffle-plugin-abigen"
  ]
};
