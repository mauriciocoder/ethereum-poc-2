const HDWalletProvider = require('truffle-hdwallet-provider')
const Web3 = require('web3')
const {
  interface,
  bytecode
} = require('./compile')

// Rynkeby provider with my account as a wallet to deploy the contract
const provider = new HDWalletProvider(
  'voice nuclear length remind interest install retreat elite empty badge swarm ready',
  'https://rinkeby.infura.io/QRU9PdFCPOrN8KzhsaaQ'
)

const web3 = new Web3(provider)

const deploy = async () => {
  // Get a list of all accounts (in that case just the one specified before)
  accounts = await web3.eth.getAccounts()
  console.log('accounts', JSON.stringify(accounts))
  // Use an account to deploy the contract
  let deployment = await new web3.eth.Contract(JSON.parse(interface))  // Instructs web3 in order to understand how is my contract
    .deploy({
      data: bytecode,
      arguments: ['My first deployed contract!']
    })  // Deploys the bytecode and also initialise it (call constructor) with arguments
    .send({
      from: accounts[0],
      gas: '1000000'
    })  // Send it to network
  console.log('Deployment address', deployment.options.address)
}
deploy()
