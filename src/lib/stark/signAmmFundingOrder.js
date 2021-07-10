const P = require('aigle')
const createSignedTransaction = require('../dvf/createSignedTransaction')

module.exports = dvf => async data => ({
  ...data,
  starkPublicKey: await dvf.dvfStarkProvider.getPublicKey(),
  // Need to do this in series since createSignedTransaction might call
  // into ledger and these calls cannot be executed in parallel.
  orders: await P.mapSeries(
    data.orders,
    async order => ({
      ...order,
      starkOrder: await createSignedTransaction(dvf)(order.starkOrder)
    })
  )
})
