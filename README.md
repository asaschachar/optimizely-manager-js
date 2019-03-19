# Optimizely Datafile Manager Node

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
  logLevel: 0,
  sdkKey: 'Ly8FQj6vSaDcZUjySoWnWz',
})
```

## Usage
When you want to use a feature flag:
```javascript
const optimizely = OptimizelyManager.getClient();
const enabled = optimizely.isFeatureEnabled('sale_price');
```

## TODO
- Add tests and attempt to get to 100% unit test coverage
- Start separate ticket on figuring out how to put datafile on window variable
