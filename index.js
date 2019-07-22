const http = require('http')
const https = require('https')
const querystring = require('querystring')
const FormData = require('form-data')
const fs = require('fs')

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
        'protocol': this.request.options.protocol ? this.request.options.protocol : 'https:',
        'host': this.request.options.host ? this.request.options.host : 'localhost',
        'port': this.request.options.port ? this.request.options.port : 443,
        'method': this.request.options.method ? this.request.options.method : 'GET',
        'path': path,
        'headers': this.request.options.headers ? this.request.options.headers : {},
        'auth': this.request.options.auth ? this.request.options.auth : null,
        'timeout': this.request.options.timeout ? this.request.options.timeout : 30000,
      }

      // Handle multipart form submissions
      let form = null
      if (this.request.options.form != null) {
        form = new FormData()
        const optionsForm = this.request.options.form

        if (optionsForm.fields != null) {
          for (const formField in optionsForm.fields) {
            if (Object.prototype.hasOwnProperty.call(optionsForm.fields, formField)) {
              form.append(formField, optionsForm.fields[formField])
            }
          }
        }

        if (optionsForm.files != null) {
          for (const formFile in optionsForm.files) {
            if (Object.prototype.hasOwnProperty.call(optionsForm.files, formFile)) {
              form.append(formFile, fs.createReadStream(optionsForm.files[formFile]))
            }
          }
        }

        const formHeaders = form.getHeaders()
        for (const formHeaderKey in formHeaders) {
          if (Object.prototype.hasOwnProperty.call(formHeaders, formHeaderKey)) {
            options.headers[formHeaderKey] = formHeaders[formHeaderKey]
          }
        }
      }

      if (this.request.options.body != null) {
        options.headers['Content-Length'] = JSON.stringify(this.request.options.body).length
        options.requestBody = this.request.options.body
      }

      const hrstart = process.hrtime()
      const protocol = options.protocol == 'http:' ? http : https
      const req = protocol.request(options, (res) => {
        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', (chunk) => {
          if (this.request.options.chunked) {
            rawData = '{}'
            callback(chunk, false)
          } else {
            rawData += chunk
          }
        })
        res.on('end', () => {
          const hrend = process.hrtime(hrstart)
          const {statusCode} = res
          const headers = res.headers

          try {
            let parsedData = null
            if (headers['content-type'].includes('json')) {
              parsedData = JSON.parse(rawData)
            } else {
              parsedData = rawData
            }
            const result = {
              'options': options,
              'statusCode': statusCode,
              'headers': headers,
              'body': parsedData,
              'error': null,
              'responseTime': hrend[1] / 1000000,
              'endTime': Date.now(),
            }
            callback(result, true)
          } catch (e) {
            const result = {
              'options': options,
              'statusCode': statusCode,
              'headers': headers,
              'body': null,
              'error': e,
              'responseTime': hrend[1] / 1000000,
              'endTime': Date.now(),
            }
            callback(result, true)
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
          'endTime': Date.now(),
        }
        callback(result, true)
      })

      if (form != null) {
        form.pipe(req)
      } else {
        if (this.request.options.body != null) {
          req.write(JSON.stringify(this.request.options.body))
        }
        req.end()
      }
    }

    this.buildPath = function(options) {
      const basePath = options.path ? options.path : '/'
      if (options.queryString != null) {
        const queryString = querystring.stringify(options.queryString)
        if (queryString != '') {
          return basePath + '?' + queryString
        } else {
          return basePath
        }
      } else {
        return basePath
      }
    }
  }
}

module.exports = LynnRequest
