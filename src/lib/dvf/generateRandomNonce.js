// This is max nonce value accepted by sw.
const nonceMax = Math.pow(2, 31) - 1
module.exports = () => {
  return Math.ceil(Math.random() * nonceMax)
}
