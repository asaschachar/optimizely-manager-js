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

In another file
```javascript
const optimizely = OptimizelyManager.getClient();
const enabled = optimizely.isFeatureEnabled('sale_price', 'user123');

```


## What is the Optimizely Manager
The OptimizelyManager is a convenient wrapper around the Optimizely SDK, which provides a simpler interface for instantiating and using Optimizely.

## How it works
Upon passing in an sdkKey, the OptimizelyManager starts polling at an interval for the datafile, a file on Optimizely's CDN containing all the feature configuration saved in the Optimizely UI.

## When to use just the SDK
If you want more control over when and how an instance of the Optimizely SDK gets created, just the Optimizely JavaScript SDK.


