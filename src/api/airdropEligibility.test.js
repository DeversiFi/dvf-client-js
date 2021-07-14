const nock = require('nock')
const instance = require('./test/helpers/instance')

const mockGetConf = require('./test/fixtures/getConf')

let dvf

describe('dvf.airdropEligibility', () => {
  beforeAll(async () => {
    mockGetConf()
    dvf = await instance()
  })

  it('Returns the DVF airdrop amount eligible for this address recieved from the API....', async () => {
    const ethAddress = '0x15A9812E214B18cF5346a2FEC9EA91A68FD9ce00'
    const token = 'DVF'

    const apiResponse = {
      claims: [
        {
          user: ethAddress,
          token,
          amount: 21.52,
          requested: false
        }
      ],
      isRegistered: true
    }

    nock(dvf.config.api)
      .get('/v1/trading/r/airdropEligibility')
      .query({ ethAddress, token })
      .reply(200, apiResponse)

    const res = await dvf.airdropEligibility({ethAddress, token})
    expect(res).toEqual(apiResponse)
  })
})
