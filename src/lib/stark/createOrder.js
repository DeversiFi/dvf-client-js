const P = require('aigle')
const { preparePriceBN, prepareAmountBN, splitSymbol } = require('dvf-utils')
const DVFError = require('../dvf/DVFError')
const computeBuySellData = require('../dvf/computeBuySellData')

module.exports = async (
  dvf,
  { symbol, amount, price, validFor, feeRate, nonce, signature, settleSpread = {} }
) => {
  price = preparePriceBN(price)
  amount = prepareAmountBN(amount)

  feeRate = parseFloat(feeRate)

  if (Number.isNaN(feeRate)) {
    feeRate = dvf.config.DVF.defaultFeeRate
  }

  const symbolArray = splitSymbol(symbol)
  const baseSymbol = symbolArray[0]
  const quoteSymbol = symbolArray[1]

  const amountIsPositive = amount.isGreaterThan(0)
  const buySymbol = amountIsPositive ? baseSymbol : quoteSymbol
  const sellSymbol = amountIsPositive ? quoteSymbol : baseSymbol

  const sellCurrency = dvf.token.getTokenInfo(sellSymbol)
  const buyCurrency = dvf.token.getTokenInfo(buySymbol)

  const [vaultIdSell, vaultIdBuy] = await P.join(
    dvf.getVaultId(sellSymbol, nonce, signature),
    dvf.getVaultId(buySymbol, nonce, signature)
  )
  if (!(sellCurrency && buyCurrency)) {
    if (!vaultIdSell) {
      throw new DVFError('ERR_SYMBOL_DOES_NOT_MATCH')
    }
  }

  const settleSpreadBuy = settleSpread.buy != null
    ? settleSpread.buy
    : buyCurrency.settleSpread
  const settleSpreadSell = settleSpread.buy != null
    ? settleSpread.sell
    : sellCurrency.settleSpread

  const {
    amountSell,
    amountBuy
  } = computeBuySellData(dvf, { symbol, amount, price, feeRate, settleSpreadBuy, settleSpreadSell })

  let expirationHours = Math.floor(Date.now() / (1000 * 3600))

  if (validFor) {
    expirationHours += parseInt(validFor)
  } else {
    expirationHours += parseInt(dvf.config.defaultStarkExpiry)
  }

  const starkOrder = {
    vaultIdSell: vaultIdSell,
    vaultIdBuy: vaultIdBuy,
    amountSell,
    amountBuy,
    tokenSell: sellCurrency.starkTokenId,
    tokenBuy: buyCurrency.starkTokenId,
    nonce: dvf.util.generateRandomNonce(),
    expirationTimestamp: expirationHours
  }
  const starkMessage = dvf.stark.createOrderMessage(starkOrder)

  return {
    starkOrder: starkOrder,
    starkMessage: starkMessage
  }
}
