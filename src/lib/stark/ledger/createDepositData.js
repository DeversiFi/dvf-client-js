module.exports = async (dvf, path, token, amount) => {
  amount = dvf.util.prepareDepositAmount(amount, token)
  const tempVaultId = dvf.config.DVF.tempStarkVaultId
  const starkVaultId = await dvf.getVaultId(token)

  const starkDeposit = await dvf.stark.ledger.createSignedTransfer(
    path,
    token,
    amount,
    tempVaultId,
    starkVaultId
  )
  starkDeposit.starkVaultId = starkVaultId

  return starkDeposit
}
