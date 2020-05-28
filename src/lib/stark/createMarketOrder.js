const P = require('aigle')
const { preparePriceBN, prepareAmountBN, splitSymbol, toBN } = require('dvf-utils')
const DVFError = require('../dvf/DVFError')
const computeBuySellData = require('../dvf/computeBuySellData')

module.exports = async (dvf, { symbol, tokenToSell, amountToSell, worstCasePrice, validFor, feeRate }) => {
  amountToSell = prepareAmountBN(amountToSell)
  worstCasePrice = preparePriceBN(worstCasePrice)

  feeRate = parseFloat(feeRate) || dvf.config.DVF.defaultFeeRate
  
  const symbolArray = splitSymbol(symbol)
  const baseSymbol = symbolArray[0]
  const quoteSymbol = symbolArray[1]

  const sellSymbol = tokenToSell
  const buySymbol = sellSymbol === quoteSymbol ? baseSymbol : quoteSymbol

  const sellCurrency = dvf.token.getTokenInfo(sellSymbol)
  const buyCurrency = dvf.token.getTokenInfo(buySymbol)

  const [vaultIdSell, vaultIdBuy] = await P.join(
    dvf.getVaultId(sellSymbol),
    dvf.getVaultId(buySymbol)
  )
  if (!(sellCurrency && buyCurrency)) {
    if (!vaultIdSell) {
      throw new DVFError('ERR_SYMBOL_DOES_NOT_MATCH')
    }
  }

  // symbol is changed if necessary to avoid making changes to computeBuySellData
  const flippedSymbol = `${sellSymbol}:${buySymbol}`
  const adjustedPrice = flippedSymbol === symbol ? worstCasePrice : toBN(1 / worstCasePrice)
  const settleSpreadBuy = buyCurrency.settleSpread
  const settleSpreadSell = sellCurrency.settleSpread

  const {
    amountSell,
    amountBuy
  } = computeBuySellData(dvf, { symbol: flippedSymbol, amount: amountToSell.negated(), price: adjustedPrice, feeRate, settleSpreadBuy, settleSpreadSell })

  let expiration // in hours
  expiration = Math.floor(Date.now() / (1000 * 3600))

  if (validFor) {
    expiration += parseInt(validFor)
  } else {
    expiration += parseInt(dvf.config.defaultStarkExpiry)
  }

  const starkOrder = {
    vaultIdSell: vaultIdSell,
    vaultIdBuy: vaultIdBuy,
    amountSell,
    amountBuy,
    tokenSell: sellCurrency.starkTokenId,
    tokenBuy: buyCurrency.starkTokenId,
    nonce: dvf.util.generateRandomNonce(),
    expirationTimestamp: expiration
  }

  const starkMessage = dvf.stark.createOrderMessage(starkOrder)

  return {
    starkOrder: starkOrder,
    starkMessage: starkMessage,
    settleSpreadBuy,
    settleSpreadSell
  }
}
