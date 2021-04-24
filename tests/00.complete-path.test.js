const sw = require('starkware_crypto')
const { setup, register, deposit, withdraw, drip, testOrders, sleep } = require('./helpers')

describe.skip('00 - Complete Path', () => {

  let dvf, address, privateKey, setupData, starkSignature, nonce

  before(async () => {
    setupData = await setup()
    address = setupData.account.address
    privateKey = setupData.account.privateKey
    nonce = Date.now() / 1000
  })

  it('should register', async () => {
    expect(address).not.toBeNull()
    expect(privateKey).not.toBeNull()
    console.log('account ->', setupData)
    const bypassRegister = false
    const useTradingKey = true
    dvf = await register(setupData, bypassRegister, useTradingKey)
    const keyPair = sw.ec.keyFromPrivate(privateKey, 'hex')
    starkSignature = dvf.stark.sign(keyPair, nonce)
    expect(dvf).not.toBeNull()
  })

  it('should make a ETH deposit', async () => {
    expect((await dvf.getDeposits()).length).toEqual(0)
    const token = 'ETH'
    const depositResponse = await deposit(dvf, token, 0.95, privateKey)
    console.log('deposit response ->', depositResponse)
    expect(depositResponse).not.toBeNull()
  })

  it('should make a token deposit', async () => {
    const token = 'USDT'

    // get some tokens from the faucet
    await drip(dvf, dvf.config.tokenRegistry[token].tokenAddress, address)

    await dvf.contract.approve(token)
    const tokenDepositResponse = await deposit(dvf, token, 100, privateKey)
    console.log('token deposit response ->', tokenDepositResponse)
    expect(tokenDepositResponse).not.toBeNull()
  })

  it('should check the deposits and the balance using the trading key', async () => {
    const deposits = await dvf.getDeposits(null, nonce, starkSignature)
    expect(deposits.length).toEqual(2)

    const balances = await dvf.getBalance(null, nonce, starkSignature)
    expect(balances.length).toEqual(2)
  })

  it('should test ETH order creation and cancelation', async () => {
    await testOrders(dvf, privateKey, 'ETH', 'USDT', -0.3, 2500)
    const orders = await dvf.getOrders()
    expect(orders.length).toEqual(0)
  })

  it('should test token order creation and cancelation', async () => {
    await testOrders(dvf, privateKey, 'USDT', 'ETH', -100, 0.3)
    const orders = await dvf.getOrders()
    expect(orders.length).toEqual(0)
  })

  it('should withdraw ETH', async () => {
    let token = 'ETH'
    expect((await dvf.getWithdrawals()).length).toEqual(0)

    const waitWithdrawToBeReady = true
    const withdrawal = await withdraw(dvf, token, 0.5, privateKey, waitWithdrawToBeReady)
    console.log('withdraw', withdrawal)

    const getBalanceResponse = await dvf.getBalance()
    console.log('getBalance response ->', getBalanceResponse)
    expect(getBalanceResponse[0].balance).toEqual('45000000')
    expect(getBalanceResponse[0].available).toEqual('45000000')

    // for a short period the withdrawals will be duplicated on the db until our server finish sync
    await sleep(50)

    const withdrawals = await dvf.getWithdrawals()
    expect(withdrawals.length).toEqual(1)

    const withdrawOnchainResponse = await dvf.withdrawOnchain(token)
    console.log('withdrawOnchain response ', withdrawOnchainResponse)
    expect(withdrawOnchainResponse.transactionHash).toMatch('0x')
  })

  it('should check ETH withdrawal completion using trading key', async () => {
    await sleep(10)

    const emptyWithdrawals = await dvf.getWithdrawals(null, nonce, starkSignature)
    expect(emptyWithdrawals.length).toEqual(0)
  })

  it('should withdraw a token', async () => {
    const token = 'USDT'

    const waitWithdrawToBeReady = true
    const tokenWithdrawal = await withdraw(dvf, token, 50, privateKey, waitWithdrawToBeReady)
    console.log('tokenWithdrawal', tokenWithdrawal)

    // for a short period the withdrawals will be duplicated on the db until our server finish sync
    await sleep(50)

    const tokenWithdrawOnchainResponse = await dvf.withdrawOnchain(token)
    console.log('tokenWithdrawOnchain response ', tokenWithdrawOnchainResponse)
    expect(tokenWithdrawOnchainResponse.transactionHash).toMatch('0x')

    await sleep(10)
    expect((await dvf.getWithdrawals()).length).toEqual(0)
  })

  it('should check token withdrawal completion using trading key', async () => {
    await sleep(10)
    const emptyWithdrawals = await dvf.getWithdrawals(null, nonce, starkSignature)
    expect(emptyWithdrawals.length).toEqual(0)
  })
})
