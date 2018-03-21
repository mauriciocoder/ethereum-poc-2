const assert = require('assert')
const ganache = require('ganache-cli')
const Web3 = require('web3')

const provider = ganache.provider();
// Connect to ganache local network
const web3 = new Web3(provider);

// Import compiled source
const {
  interface,
  bytecode
} = require('../compile')

let accounts
let lottery

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts()
  // Use an account to deploy the contract
  lottery = await new web3.eth.Contract(JSON.parse(interface)) // Instructs web3 in order to understand how is my contract
    .deploy({
      data: bytecode
    }) // Deploys the bytecode and also initialise it (call constructor) with arguments
    .send({
      from: accounts[0],
      gas: '1000000'
    }) // Send it to network
  lottery.setProvider(provider);
})

describe('Lottery', () => {
  it('Deploys a contract', () => {
    //console.log(accounts)
    //console.log('deployed contract:')
    //console.log(inbox)
    //console.log('methods:')
    //console.log(lottery.methods)
    //console.log('deployed address:')
    //console.log(lottery.options.address)
    assert.ok(lottery.options.address)
  })

  it('has a manager', async () => {
    let manager = await lottery.methods.manager().call()
    assert.equal(manager, accounts[0])
  })

  it('let a player enter and charge', async () => {
    // Add first player
    await lottery.methods.enter().send({
      from: accounts[1],
      gas: '1000000',
      value: web3.utils.toWei('1', 'ether')
    })
    let balance = await web3.eth.getBalance(lottery.options.address)
    assert.equal(web3.utils.fromWei(balance), '1')

    let players = await lottery.methods.getPlayers().call()
    assert.equal(players.length, 1)
    assert.equal(accounts[1], players[0])

    // Add a second player
    await lottery.methods.enter().send({
      from: accounts[2],
      gas: '1000000',
      value: web3.utils.toWei('1', 'ether')
    })
    balance = await web3.eth.getBalance(lottery.options.address)
    assert.equal(web3.utils.fromWei(balance), '2')
    players = await lottery.methods.getPlayers().call()
    assert.equal(players.length, 2)
    assert.equal(accounts[2], players[1])
  })

  it('tries to add a player with a value lower than minimum', async () => {
    try {
      await lottery.methods.enter().send({
        from: accounts[2],
        gas: '1000000',
        value: web3.utils.toWei('0.001', 'ether')
      })
      assert(false)
    } catch (err) {
      assert(err)
    }
  })

  it('Only manager can pick winner', async () => {
    try {
      await lottery.methods.pickWinner().send({
        from: accounts[1]
      })
      assert(false)
    } catch (err) {
      assert(err)
    }
  })

  it('picks a winner and transfer prize', async () => {
    let manager = await lottery.methods.manager().call()
    let player = accounts[1]
    // Add a player
    await lottery.methods.enter().send({
      from: player,
      value: web3.utils.toWei('1', 'ether')
    })
    let playerBalanceBeforeWin = parseInt(await web3.eth.getBalance(player))
    await lottery.methods.pickWinner().send({
      from: manager
    })
    let playerBalanceAfterWin = parseInt(await web3.eth.getBalance(player))
    assert.equal(playerBalanceBeforeWin + parseInt(web3.utils.toWei('1', 'ether')), playerBalanceAfterWin)

    let balance = await web3.eth.getBalance(lottery.options.address)
    assert.equal(balance, 0)
  })

})
/*
// Mocka testing example
class Car {
  park() {
    return 'stopped'
  }

  drive() {
    return 'vrooom'
  }
}

let car;

beforeEach(() => {
  car = new Car()
})

describe('Car testing', () => {
  it('park', () => {
    assert.equal(car.park(), 'stopped')
  })

  it('drive', () => {
    assert.equal(car.drive(), 'vrooom')
  })
})
*/
