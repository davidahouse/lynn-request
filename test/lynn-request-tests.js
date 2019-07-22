/* eslint-env mocha */
const expect = require('chai').expect
const LynnRequest = require('../index.js')
const nock = require('nock')
const fs = require('fs')

const successResponseBasic = require('../test/mockResponses/200_basic')

const successAPIRequest = {
  'options': {
    'protocol': 'http:',
    'method': 'GET',
    'host': 'localhost',
    'port': '8080',
    'path': '/contents',
  },
}

const successChunkedAPIRequest = {
  'options': {
    'protocol': 'http:',
    'method': 'GET',
    'host': 'localhost',
    'port': '8080',
    'path': '/contents',
    'chunked': true,
  },
}

const successPUTRequest = {
  'options': {
    'protocol': 'http:',
    'method': 'PUT',
    'host': 'localhost',
    'port': '8080',
    'path': '/contents',
    'headers': {'Content-type': 'application/json'},
    'body': {test: '123', another: '456'},
  },
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

/**
 * nockSuccessChunked
 * @return {object} scope
 */
function nockSuccessChunked() {
  nock.cleanAll()
  const rawData = fs.readFileSync('./test/mockResponses/200_chunked.txt')
  const scope = nock('http://localhost:8080')
      .get('/contents')
      .reply(200, rawData)
  return scope
}

/**
 * nockSuccessPut
 * @return {object} scope
 */
function nockSuccessPut() {
  nock.cleanAll()
  const scope = nock('http://localhost:8080')
      .put('/contents')
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
        expect(result.endTime).to.not.equal(null)
        done()
      })
    })

    it('should transmit body correctly', function(done) {
      nockSuccessPut()
      const runner = new LynnRequest(successPUTRequest)
      runner.execute(function(result) {
        expect(result.statusCode).to.equal(200)
        done()
      })
    })

    it('should transmit chunked body correctly', function(done) {
      nockSuccessChunked()
      const runner = new LynnRequest(successChunkedAPIRequest)
      runner.execute(function(result, finished) {
        console.log('finished: ' + finished + ' result.length: ' + result.length)
        if (finished) {
          expect(result.length).to.be.lessThan(300)
          done()
        } else {
          expect(result.length).to.be.greaterThan(900)
        }
      })
    })
  })
})
