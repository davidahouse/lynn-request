# lynn-request

[![npm (scoped)](https://img.shields.io/npm/v/@davidahouse/lynn-request.svg)](https://www.npmjs.com/package/davidahouse/lynn-request)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@davidahouse/lynn-request.svg)](https://www.npmjs.com/package/davidahouse/lynn-request)

## Install

```
$ npm install --save lynn-request
```

## Usage

```
const LynnRequest = require('lynn-request')

const request = {
  'options': {
    'protocol': 'http:',
    'method': 'GET',
    'host': 'localhost',
    'port': '8080',
    'path': '/query',
  },
}

const runner = new LynnRequest(request)
runner.execute(function(result) {
  // result contains statusCode, headers, data and possibly error
}

```