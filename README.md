# Optimizely Manager Node

[![Travis CI](https://img.shields.io/travis/asaschachar/optimizely-manager-js.svg)](https://travis-ci.org/asaschachar/optimizely-manager-js)
[![Coverage Status](https://coveralls.io/repos/github/asaschachar/optimizely-manager-js/badge.svg?branch=master)](https://coveralls.io/github/asaschachar/optimizely-manager-js?branch=master)


## Installation
```
npm install --save git+https://git@github.com/asaschachar/optimizely-manager-js.git#v4.0.1
```

## Setup
At your application startup:
```javascript
const OptimizelyManager = require('@optimizely/optimizely-manager');

OptimizelyManager.configure({
  sdkKey: '<YOUR_SDK_KEY>',
})
```

## Usage
When you want to use a feature flag:
```javascript
const optimizely = OptimizelyManager.getClient();
const enabled = optimizely.isFeatureEnabled('sale_price', 'user123');
```
