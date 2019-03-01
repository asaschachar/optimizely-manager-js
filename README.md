# Optimizely Datafile Manager Node
                                                                        
## Installation
 * `npm install --save `
 
## Usage 
At your application startup:
```
const OptimizelyManager = require('./optimizely-manager');
const optimizely = new OptimizelyManager({
  sdkKey: 'Ly8FQj6vSaDcZUjySoWnWz'
})
```
When you want to use a feature flag:
```
const enabled = optimizely.isFeatureEnabled('sale_price', userId);
```                                                                     
                                                                        
If you are using a feature flag in another file, get the optimizely instance first                                                                        
```
const optimizely = OptimizelyManager.instance.getClient();
const enabled = optimizely.isFeatureEnabled('sale_price', 'TEST_ID');
```
