const nock = require('nock')

module.exports = () => {
  const httpResponse = {
    address: '0x65CEEE596B2aba52Acc09f7B6C81955C1DB86404',
    timestamp: 1568959208939,
    fees: {
      small: { threshold: 0, feeBps: 25 },
      medium: { threshold: 500, feeBps: 21 },
      large: { threshold: 2000, feeBps: 20 }
    },
    signature: '0x52f18b47494e465aa4ed0f0f123fae4d40d3ac0862b61862e6cc8e5a119dbfe1061a4ee381092a10350185071f4829dbfd6c5f2e26df76dee0593cbe3cbd87321b'
  }

  nock('https://api.deversifi.com')
    .get('/api/v1/feeRate/' + '0x65CEEE596B2aba52Acc09f7B6C81955C1DB86404')
    .reply(200, httpResponse)
}
