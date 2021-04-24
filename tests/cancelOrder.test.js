const nock = require('nock')
const sinon = require('sinon')
const mockGetConf = require('./fixtures/getConf')

describe('dvf.cancelOrder', () => {
  before(async () => {
    nock.cleanAll()
    mockGetConf()
  })

  beforeEach(() => {
    nock.cleanAll()
  })

  it('Posts to cancel order API and gets response', async () => {
    const orderId = '1'
    const apiResponse = { cancelOrder: 'success' }

    const payloadValidator = sinon.spy(body => {
      body.orderId.should.equal(orderId)

      ;(typeof body.orderId).should.equal('string')
      ;(typeof body.nonce).should.equal('string')
      ;(typeof body.signature).should.equal('string')

      return true
    })

    nock(dvf.config.api)
      .post('/v1/trading/w/cancelOrder', payloadValidator)
      .reply(200, apiResponse)

    const response = await dvf.cancelOrder(orderId)

    payloadValidator.called.should.equal(true)
    response.should.deep.equal(apiResponse)
  })

  it('Posts to cancel order API with { cid } and gets response', async () => {
    const cid = 'cid-1'
    const apiResponse = { cancelOrder: 'success' }

    const payloadValidator = sinon.spy(body => {
      body.cid.should.equal(cid)
      ;(typeof body.cid).should.equal('string')
      ;(typeof body.nonce).should.equal('string')
      ;(typeof body.signature).should.equal('string')

      return true
    })

    nock(dvf.config.api)
      .post('/v1/trading/w/cancelOrder', payloadValidator)
      .reply(200, apiResponse)

    const response = await dvf.cancelOrder({ cid })

    payloadValidator.called.should.equal(true)
    response.should.deep.equal(apiResponse)
  })

  it('Posts to cancel order API and gets error response', async () => {
    const orderId = '1'
    const apiErrorResponse = {
      statusCode: 422,
      error: 'Unprocessable Entity',
      message:
        'Please contact support if you believe there should not be an error here',
      details: {
        error: {
          type: 'DVFError',
          message: 'STARK_SIGNATURE_VERIFICATION_ERROR'
        }
      }
    }
    const payloadValidator = sinon.spy(() => true)

    nock(dvf.config.api)
      .post('/v1/trading/w/cancelOrder', payloadValidator)
      .reply(422, apiErrorResponse)

    try {
      await dvf.cancelOrder(orderId)
    } catch (e) {
      e.error.should.deep.equal(apiErrorResponse)
      payloadValidator.called.should.equal(true)
    }
  })
})
