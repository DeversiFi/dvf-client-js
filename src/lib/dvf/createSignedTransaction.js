// Logic common to all stark transactions/orders.
// Takes transaction with all props apart from nonce and expirationTimestamp
// and returns one with those props as well a signature added.
const addNonceAndExpirationTimestamp = require('./addNonceAndExpirationTimestamp')

module.exports = dvf => async transaction => {
  // dvfStarkProvider abstracts specifics of how a transaction is signed.

  transaction = addNonceAndExpirationTimestamp(dvf.config)(transaction)
  const signature = await dvf.dvfStarkProvider.sign(transaction)

  return { ...transaction, signature }
}
