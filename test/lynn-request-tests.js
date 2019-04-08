/* eslint-env mocha */
const expect = require('chai').expect
const LynnRequest = require('../index.js')
const nock = require('nock')

const successResponseBasic = require('../test/mockResponses/200_basic')

const successAPIRequest = {
  'options': {
    'protocol': 'http:',
    'method': 'GET',
    'host': 'localhost',
    'port': '8080',
    'path': '/contents',
  }
}

/**
 * nockSuccessBasic
 * @return {object} scope
 */
function nockSuccessBasic() {
  nock.cleanAll()
  const scope = nock('http://localhost:8080')
      .get('/contents')
      .reply(200, successResponseBasic)
  return scope
}

describe('Lynn Request', function() {
  beforeEach(() => {
  })

  it('should retain request after construction', function() {
    const runner = new LynnRequest(successAPIRequest)
    expect(runner.request.options.method).to.equal('GET')
  })

  describe('execute', function() {
    it('should call the callback when finished', function(done) {
      nockSuccessBasic()
      const runner = new LynnRequest(successAPIRequest)
      runner.execute(function(result) {
        expect(result.statusCode).to.equal(200)
        done()
      })
    })
  })
})
