# Optimizely Datafile Manager JavaScript (Node & Browser)

[![Travis CI](https://img.shields.io/travis/asaschachar/optimizely-manager-js.svg)](https://travis-ci.org/asaschachar/optimizely-manager-js)
[![Coverage Status](https://coveralls.io/repos/github/asaschachar/optimizely-manager-js/badge.svg?branch=master)](https://coveralls.io/github/asaschachar/optimizely-manager-js?branch=master)


## Installation
```
npm install --save git+https://git@github.com/asaschachar/optimizely-manager-js.git#v3.0.1
```

## Setup
At your application startup:
```javascript
const OptimizelySdk = require('@optimizely/optimizely-sdk');
const OptimizelyManager = require('@optimizely/optimizely-manager');

OptimizelyManager.withSdk(OptimizelySdk);
OptimizelyManager.configure({
  logLevel: OptimizelySdk.enums.LOG_LEVEL.DEBUG,
  sdkKey: '<YOUR_SDK_KEY>',
})
```

## Usage
When you want to use a feature flag:
```javascript
const optimizely = OptimizelyManager.getClient();
const enabled = optimizely.isFeatureEnabled('sale_price');
```

## TODO
- Expose all APIs? Not just the rollouts ones?
- In the case that we don't expose userId, you could call isFeatureEnabled and getEnabledFeatures and they'll return different things. Should the userId be random per instance of the manager rather than per call to isFeatureEnabled
- Start separate ticket on figuring out how to put datafile on window variable

