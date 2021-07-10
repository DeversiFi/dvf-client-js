const DVFError = require('../dvf/DVFError')
const makeKeystoreProvider = require('../keystore/index')
const makeLedgerProvider = require('../ledger/index')

module.exports = (dvf, wallet) => {
  if (!wallet) throw new DVFError('WALLET_IS_REQUIRED')

  dvf.config.wallet = wallet

  if (wallet.type === 'tradingKey') {
    if (!wallet.meta.starkPrivateKey) throw new DVFError('STARK_PRIVATE_KEY_IS_REQUIRED')

    const provider = makeKeystoreProvider(dvf.sw)(wallet.meta.starkPrivateKey)
    dvf.dvfStarkProvider = provider
  } else if (wallet.type === 'ledger') {
    if (!wallet.meta.path) throw new DVFError('LEDGER_PATH_IS_REQUIRED')

    const provider = makeLedgerProvider(dvf)
    dvf.dvfStarkProvider = provider
  }
}
