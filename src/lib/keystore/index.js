const swJS = require('starkware_crypto')
const FP = require('lodash/fp')

const {
  starkTransferTxToMessageHash,
  starkLimitOrderToMessageHash
} = require('dvf-utils')

const DVFError = require('../dvf/DVFError')
const starkSign = require('../stark/starkSign')
const createKeyPair = require('../stark/createKeyPair')

const transferTransactionTypes = [
  'ConditionalTransferRequest',
  'TransferRequest'
]

const getMessage = sw => tx => {
  if (tx.type != null) {
    if (!(transferTransactionTypes.includes(tx.type))) {
      throw new DVFError(`Unsupported stark transaction type: ${tx.type}`, {tx})
    }
    return starkTransferTxToMessageHash(sw)(tx)
  } else {
    return starkLimitOrderToMessageHash(sw)(tx)
  }
}

module.exports = sw => starkPrivateKey => {
  sw = sw || swJS

  if (!starkPrivateKey) throw new DVFError('STARK_PRIVATE_KEY_IS_REQUIRED')

  let starkKeyPair
  let starkPublicKey

  const createKeyPairThunk = () => createKeyPair({ sw }, starkPrivateKey)

  const getKeyPair = async () => {
    if (starkKeyPair) { return starkKeyPair }
    ({ starkPublicKey, starkKeyPair } = await createKeyPairThunk())
    return starkKeyPair
  }

  const getPublicKey = async () => {
    if (starkPublicKey) { return starkPublicKey }
    ({ starkPublicKey, starkKeyPair } = await createKeyPairThunk())
    return starkPublicKey
  }

  const sign = async tx => {
    const starkKeyPair = await getKeyPair()

    const starkMessage = getMessage(sw)(tx)
    const signature = FP.mapValues(
      x => '0x' + x,
      starkSign({ sw }, starkKeyPair, starkMessage)
    )

    return signature
  }

  const getWalletType = () => 'KEYSTORE'

  return { sign, getKeyPair, getPublicKey, getWalletType }
}
