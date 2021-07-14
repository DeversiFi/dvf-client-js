const { Joi } = require('dvf-utils')
const get = require('../lib/dvf/get-generic')
const validateWithJoi = require('../lib/validators/validateWithJoi')

const schema = Joi.object({
  ethAddress: Joi.ethAddress(),
  token: Joi.string()
})

const validateInputs = validateWithJoi(schema)('INVALID_METHOD_ARGUMENT')({
  context: 'airdropEligibility'
})

module.exports = async (dvf, data) => {
  const { ethAddress, token } = validateInputs(data)
  const endpoint = '/v1/trading/r/airdropEligibility'
  return get(dvf, endpoint, {ethAddress, token})
}
