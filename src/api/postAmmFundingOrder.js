const { Joi } = require('dvf-utils')
const R = require('ramda')

const post = require('../lib/dvf/post-authenticated')
const validateWithJoi = require('../lib/validators/validateWithJoi')

const unsignedInt = Joi.number().integer().min(0)
const maxTimestampHours = Math.pow(2, 22) * 1000 * 60 * 60 - 1

// NOTE: this schema should be shared between backend and client.
const starkOrderSchema = Joi.object({
  vaultIdSell: unsignedInt,
  vaultIdBuy: unsignedInt,
  amountSell: Joi.string(),
  amountBuy: Joi.string(),
  tokenSell: Joi.string(),
  tokenBuy: Joi.string(),
  // If not provided, random nonce will be generated for each order.
  nonce: unsignedInt.optional(),
  // If not provided, expirationTimestamp will be set based on
  // dvf.config.defaultStarkExpiry.
  expirationTimestamp: unsignedInt.max(maxTimestampHours).optional(),
  signature: Joi.object().optional().keys({
    r: Joi.string(),
    s: Joi.string()
  })
// If orders are pre-signed, nonce and expirationTimestamp needs to be present.
}).with('signature', ['nonce', 'expirationTimestamp'])

const schema = Joi.object({
  pool: Joi.string(),
  starkPublicKey: Joi
    .object({
      x: Joi.string(),
      y: Joi.string()
    })
    .optional(),
  orders: Joi
    .array()
    .items(Joi.object({
      starkOrder: starkOrderSchema
    }))
    .length(2)
}).and(
  // If any of these are present then all are required.
  'starkPublicKey',
  'orders.0.starkOrder.signature',
  'orders.1.starkOrder.signature'
)

const validateData = validateWithJoi(schema)('INVALID_METHOD_ARGUMENT')({
  context: 'postAmmFundingOrder'
})

const endpoint = '/v1/trading/amm/fundingOrders'

module.exports = async (dvf, data, nonce, signature) => post(
  dvf, endpoint, nonce, signature, await R.compose(
    // Only sign if there is no starkPublicKey (schema ensures that signatures
    // are present if starkPublicKey is provides).
    a => a.starkPublicKey ? a : dvf.stark.signAmmFundingOrder(a),
    validateData
  )(data)
)
