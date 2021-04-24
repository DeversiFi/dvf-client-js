const nock = require('nock')

module.exports = () => {
  const ethGasStationResponse = {
    fast: 340.0,
    fastest: 450.0,
    safeLow: 200.0,
    average: 260.0,
    block_time: 13.064516129032258,
    blockNum: 10205346,
    speed: 0.9989927160035039,
    safeLowWait: 14.9,
    avgWait: 2.2,
    fastWait: 0.4,
    fastestWait: 0.4,
    gasPriceRange: {
      '450': 0.4,
      '430': 0.4,
      '410': 0.4,
      '390': 0.4,
      '370': 0.4,
      '350': 0.4,
      '330': 0.6,
      '310': 0.8,
      '290': 1.7,
      '270': 2.2,
      '250': 3.2,
      '230': 5.5,
      '210': 11.0,
      '190': 217.7,
      '180': 217.7,
      '170': 217.7,
      '160': 217.7,
      '150': 217.7,
      '140': 217.7,
      '130': 217.7,
      '120': 217.7,
      '110': 217.7,
      '100': 217.7,
      '90': 217.7,
      '80': 217.7,
      '70': 217.7,
      '60': 217.7,
      '50': 217.7,
      '40': 217.7,
      '30': 217.7,
      '20': 217.7,
      '10': 217.7,
      '8': 217.7,
      '6': 217.7,
      '4': 217.7,
      '340': 0.4,
      '260': 2.2,
      '200': 14.9
    }
  }

  nock('https://ethgasstation.info')
    .get('/json/ethgasAPI.json')
    .query(true)
    .reply(200, ethGasStationResponse)

  const mockGasResponse = {
    cheap: 700000000,
    average: 600000000,
    fast: 500000000
  }

  nock('https://api.stg.deversifi.com')
    .post('/v1/trading/r/getGasPrice', body => {
      return true
    })
    .reply(200, mockGasResponse)
}
