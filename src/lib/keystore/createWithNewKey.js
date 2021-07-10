const keystore = require('./index')
const createPrivateKey = require('../stark/createPrivateKey')

module.exports = sw => keystore(sw)(createPrivateKey())
