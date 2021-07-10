const getExpirationTimestampInHours = require('./getExpirationTimestampInHours')
const generateRandomNonce = require('./generateRandomNonce')

module.exports = ({ defaultStarkExpiry }) => transaction => {
  const expirationTimestamp = transaction.expirationTimestamp ||
    getExpirationTimestampInHours(defaultStarkExpiry)

  const nonce = transaction.nonce || generateRandomNonce()

  return {
    ...transaction,
    nonce,
    expirationTimestamp
  }
}
