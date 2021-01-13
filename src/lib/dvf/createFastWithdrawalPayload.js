const {
  fromQuantizedToBaseUnitsBN,
  Joi,
  toBN,
  toQuantizedAmountBN
} = require('dvf-utils')

const calculateFact = require('../stark/calculateFact')
const makeKeystore = require('../keystore')
const validateWithJoi = require('../validators/validateWithJoi')

const createSignedTransferPayload = require('./createSignedTransferPayload')
const DVFError = require('./DVFError')

const address0 = '0x'.padEnd(42, '0')

const getValidTokenInfo = dvf => token => {
  const tokenInfo = dvf.token.getTokenInfoOrThrow(token)

  if (!tokenInfo.starkVaultId) {
    throw new DVFError(
      'NO_STARK_VAULT_ID_FOR_TOKEN',
      { token, context: 'fastWithdrawal' }
    )
  }

  if (!tokenInfo.deversifiStarkVaultId) {
    throw new DVFError(
      'NO_DEVERSIFI_STARK_VAULT_ID_FOR_TOKEN',
      { token, context: 'fastWithdrawal' }
    )
  }

  return tokenInfo
}

const getFeeQuantised = async (dvf, token) => dvf
  .fastWithdrawalFee(token)
  .then(res => toBN(res.feeQuantised))

const schema = Joi.object({
  amount: Joi.amount().required(),
  // NOTE: we are not specifying allowed tokens here since these can change
  // dynamically. However a call to `getTokenInfoOrThrow` will ensure that
  // the token in valid.
  token: Joi.string().required(),
  // TODO: create Joi.ethAddress
  recipientEthAddress: Joi.string().optional(),
  transactionFee: Joi.alternatives()
    .try(Joi.string(), Joi.number())
    .optional()
})

const errorProps = { context: 'fastWithdrawal' }
const validateArg0 = validateWithJoi
  (schema)
  ('INVALID_METHOD_ARGUMENT')
  ({ ...errorProps, argIdx: 0 })

module.exports = async (dvf, withdrawalData, starkPrivateKey) => {
  // TODO: see todo in createTransferPayload.js
  const keystore = makeKeystore(dvf.sw)(starkPrivateKey)
  dvf = { ...dvf, dvfStarkProvider: keystore }

  const {
    amount,
    token,
    recipientEthAddress = dvf.config.ethAddress,
    transactionFee
  } = validateArg0(withdrawalData)

  const tokenInfo = getValidTokenInfo(dvf)(token)

  const feeQuantised = await (
    transactionFee
      ? toQuantizedAmountBN(tokenInfo, transactionFee)
      : getFeeQuantised(dvf, token)
  )

  const tokenContractAddress = token === 'ETH'
    ? address0
    : tokenInfo.tokenAddress
  const quantisedAmount = toQuantizedAmountBN(tokenInfo, amount)
  const baseUnitsAmount = fromQuantizedToBaseUnitsBN(tokenInfo)(quantisedAmount)

  const nonce = dvf.util.generateRandomNonce()

  // On chain transfer will be for the amount without fee
  const fact = calculateFact(
    recipientEthAddress, baseUnitsAmount.toString(), tokenContractAddress, nonce
  )

  const { DVF } = dvf.config
  const tx = {
    // Stark transaction includes the fee.
    amount: quantisedAmount.plus(feeQuantised).toString(),
    fact,
    factRegistryAddress: DVF.starkExTransferRegistryContractAddress,
    nonce,
    receiverPublicKey: DVF.deversifiStarkKeyHex,
    receiverVaultId: tokenInfo.deversifiStarkVaultId,
    senderVaultId: tokenInfo.starkVaultId,
    token: tokenInfo.starkTokenId,
    type: 'ConditionalTransferRequest'
  }

  return {
    recipientEthAddress,
    transactionFee: feeQuantised.toString(),
    ...(await createSignedTransferPayload(dvf)(tx))
  }
}
