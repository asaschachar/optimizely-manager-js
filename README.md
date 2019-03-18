# Optimizely Datafile Manager Node
                                                                        
## Installation
```
npm install --save git+https://git@github.com/asaschachar/optimizely-manager-node.git
```
 
## Setup 
At your application startup:
```javascript
const OptimizelyManager = require('optimizely-manager-node');
const optimizely = new OptimizelyManager({
  sdkKey: 'Ly8FQj6vSaDcZUjySoWnWz'
})
```

## Usage
When you want to use a feature flag:
```javascript
const enabled = optimizely.isFeatureEnabled('sale_price');
```                                                                     
                                                                        
If you are using a feature flag in another file, get the optimizely instance first                                                                        
```javascript
const optimizely = OptimizelyManager.instance.getClient();
const enabled = optimizely.isFeatureEnabled('sale_price');
```
## TODO
- Polish doc strings
- Ensure basic datafile configuration is available like live updates and pollingInterval
- Build node & web packages from the same source
- Wrap localStorage in check of whether it exists
- Add tests and attempt to get to 100% unit test coverage


- Start separate ticket on figuring out how to put datafile on window variable
