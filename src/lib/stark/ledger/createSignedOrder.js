const Eth = require('@ledgerhq/hw-app-eth').default
const { byContractAddress } = require('@ledgerhq/hw-app-eth/erc20')
const DVFError = require('../../dvf/DVFError')
const BN = require('bignumber.js')
const _ = require('lodash')
const selectTransport = require('../../ledger/selectTransport')
const getTokenAddressFromTokenInfoOrThrow = require('../../dvf/token/getTokenAddressFromTokenInfoOrThrow')

const getPublicKey = async (eth, starkPath) => {
  const tempKey = (await eth.starkGetPublicKey(starkPath)).toString('hex')
  return {
    x: tempKey.substr(2, 64),
    y: tempKey.substr(66)
  }
}

module.exports = async (dvf, path, starkOrder, { returnStarkPublicKey = true } = {}) => {
  const Transport = selectTransport(dvf.isBrowser)

  const buySymbol = _.findKey(dvf.config.tokenRegistry, {
    starkTokenId: starkOrder.tokenBuy
  })

  const sellSymbol = _.findKey(dvf.config.tokenRegistry, {
    starkTokenId: starkOrder.tokenSell
  })

  const buyTokenInfo = dvf.token.getTokenInfoOrThrow(buySymbol)
  const sellTokenInfo = dvf.token.getTokenInfoOrThrow(sellSymbol)

  const transport = await Transport.create()
  const eth = new Eth(transport)
  const {address} = await eth.getAddress(path)
  const starkPath = dvf.stark.ledger.getPath(address)

  const starkPublicKey = returnStarkPublicKey
    ? null
    : await getPublicKey(eth, starkPath)

  // TODO Extract below code to a utility method
  // to be used for both buy as sell tokens and
  // for transfer method as well as well

  let buyTokenAddress = getTokenAddressFromTokenInfoOrThrow(buyTokenInfo, 'ETHEREUM')
  if (buyTokenAddress) {
    const buyTokenInfo = byContractAddress(buyTokenAddress)
    buyTokenAddress = buyTokenAddress.substr(2)
    if (buyTokenInfo) {
      await eth.provideERC20TokenInformation(buyTokenInfo)
    } else {
      if (buyTokenAddress === 'dddddd4301a082e62e84e43f474f044423921918') {
        await eth.provideERC20TokenInformation({
          data: Buffer.from(
            `03445646DDdddd4301A082e62E84e43F474f04442392191800000012000000013045022100bd8a55c10b02bbe70f7266be7f5f5e7132140623b6de3fa27bdd820f11baa0d902207eb91acba7c2c5131d8285f9eba2f0d06bc9be3b4dfc29d05b0f25aa3b620a41`,
            'hex'
          )
        })
      } else if (dvf.chainId !== 1) {
        let tokenInfo = {}
        tokenInfo['data'] = Buffer.from(
          `00${buyTokenAddress}0000000000000003`,
          'hex'
        )
        await eth.provideERC20TokenInformation(tokenInfo)
      } else {
        throw new DVFError('LEDGER_TOKENINFO_ERR')
      }
    }
  } else {
    buyTokenAddress = null
  }

  // TODO Extract below code to a utility method
  // to be used for both buy as sell tokens and
  // for transfer method as well as well

  let sellTokenAddress = getTokenAddressFromTokenInfoOrThrow(sellTokenInfo, 'ETHEREUM')
  if (sellTokenAddress) {
    const sellTokenInfo = byContractAddress(sellTokenAddress)
    sellTokenAddress = sellTokenAddress.substr(2)
    if (sellTokenInfo) {
      await eth.provideERC20TokenInformation(sellTokenInfo)
    } else {
      if (sellTokenAddress === 'dddddd4301a082e62e84e43f474f044423921918') {
        await eth.provideERC20TokenInformation({
          data: Buffer.from(
            `03445646DDdddd4301A082e62E84e43F474f04442392191800000012000000013045022100bd8a55c10b02bbe70f7266be7f5f5e7132140623b6de3fa27bdd820f11baa0d902207eb91acba7c2c5131d8285f9eba2f0d06bc9be3b4dfc29d05b0f25aa3b620a41`,
            'hex'
          )
        })
      } else if (dvf.chainId !== 1) {
        let tokenInfo = {}
        tokenInfo['data'] = Buffer.from(
          `00${sellTokenAddress}0000000000000003`,
          'hex'
        )
        await eth.provideERC20TokenInformation(tokenInfo)
      } else {
        throw new DVFError('LEDGER_TOKENINFO_ERR')
      }
    }
  } else {
    sellTokenAddress = null
  }

  const starkSignature = await eth.starkSignOrder_v2(
    starkPath,
    sellTokenAddress,
    sellSymbol === 'ETH' ? 'eth' : 'erc20',
    new BN(sellTokenInfo.quantization),
    null,
    buyTokenAddress,
    buySymbol === 'ETH' ? 'eth' : 'erc20',
    new BN(buyTokenInfo.quantization),
    null,
    starkOrder.vaultIdSell,
    starkOrder.vaultIdBuy,
    new BN(starkOrder.amountSell),
    new BN(starkOrder.amountBuy),
    starkOrder.nonce,
    starkOrder.expirationTimestamp
  )

  await transport.close()

  return { starkPublicKey, starkSignature }
}
