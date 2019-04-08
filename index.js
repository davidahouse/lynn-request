const http = require('http')
const https = require('https')
const jp = require('jsonpath')
const querystring = require('querystring')

/**
* This class represents a high level Web Request
*/
class LynnRequest {
  /**
  * Constructor for the LynnRunner class
  * @param {object} request the lynn request details
  */
  constructor(request) {
    this.request = request

    this.execute = function(callback) {
      // create our http options object
      const path = this.buildPath(this.request.options)
      const options = {
        'protocol': this.request.options.protocol ? this.request.options.protocol : 'https',
        'host': this.request.options.host ? this.request.options.host : 'localhost',
        'port': this.request.options.port ? this.request.options.port : 443,
        'method': this.request.options.method ? this.request.options.method : 'GET',
        'path': path,
        'headers': this.request.options.headers ? this.request.options.headers : {},
        'auth': this.request.options.auth ? this.request.options.auth : null,
        'timeout': this.request.options.timeout ? this.request.options.timeout : 30000
      }

      const hrstart = process.hrtime()
      const protocol = options.protocol == 'http:' ? http : https
      const req = protocol.request(options, (res) => {
        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', (chunk) => {
          rawData += chunk
        })
        res.on('end', () => {
          const hrend = process.hrtime(hrstart)
          const {statusCode} = res
          const headers = res.headers

          try {
            const parsedData = JSON.parse(rawData)
            const result = {
              'options': options,
              'statusCode': statusCode,
              'headers': headers,
              'body': parsedData,
              'error': null,
              'responseTime': hrend[1] / 1000000,
            }
            callback(result)
          } catch (e) {
            const result = {
              'options': options,
              'statusCode': statusCode,
              'headers': headers,
              'body': null,
              'error': e,
              'responseTime': hrend[1] / 1000000,
            }
            callback(result)
          }
        })
      })

      req.on('error', (e) => {
        const result = {
          'options': options,
          'statusCode': null,
          'headers': null,
          'body': null,
          'error': e,
          'responseTime': null,
        }
        callback(result)
      })

      // TODO: post a body here if necessary
      req.end()
    }

    this.buildPath = function(options) {
      const basePath = options.path ? options.path : '/'
      if (options.queryString != null) {
        return basePath + '?' + querystring.stringify(options.queryString)
      } else {
        return basePath
      }
    }
  }
}

module.exports = LynnRequest
