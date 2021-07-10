const waitForDepositCreditedOnChain = require('./helpers/waitForDepositCreditedOnChain')

const token1 = 'ETH'
const token2 = 'USDT'
const depositETHResponse = await dvf.deposit(token1, 0.1, starkPrivKey)
const depositUSDTResponse = await dvf.deposit(token2, 1000, starkPrivKey)

if (process.env.WAIT_FOR_DEPOSIT_READY === 'true') {
  await waitForDepositCreditedOnChain(dvf, depositETHResponse)
  await waitForDepositCreditedOnChain(dvf, depositUSDTResponse)
}

const pool = `${token1}:${token2}`

// Amm deposit consist of 2 orders, one for each of the pool tokens.
// The tokens need to be supplied in a specific ratio. This call fetches
// order data from Deversifi API, given one of the tokens and desired deposit
// amount for that token.
const ammFundingOrderData = await dvf.getAmmFundingOrderData({
  pool,
  token: 'ETH',
  amount: 0.1
})

// ammFundingOrderData can be inspected/validate if desired, before signing
// the orders it contains and posting them to Deversifi API.

// This call signs the orders contained in the ammFundingOrderData before
// posting them to Deversifi API. NOTE: if the orders are pre-signed, the
// method will post them as is.
const ammPostFundingOrderResponse = await dvf.postAmmFundingOrder(
  ammFundingOrderData
)

logExampleResult(ammPostFundingOrderResponse)
