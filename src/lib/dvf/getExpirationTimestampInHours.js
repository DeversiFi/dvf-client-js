const msPerHour = 1000 * 3600

module.exports = expireInHours => {
  const nowHours = Math.ceil(Date.now() / msPerHour)

  return nowHours + parseInt(expireInHours)
}
