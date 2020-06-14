module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*",
      gas: 4712388,
      gasPrice: 2000000000,
      from: '0x49a1FE8F759aa7F738E8eDe3d10E8601F76a113c'
    }
  },
  plugins: [
    "@chainsafe/truffle-plugin-abigen"
  ]
};
