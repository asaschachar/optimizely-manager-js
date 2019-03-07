/**
 * Optimizely Datafile Manager Node
 *
 * Creates a singleton instance of a manager which then can be used
 * to interact with the Optimizely SDK anywhere in your application.
 */
const request = require('request-promise');
const assert = require('assert');
const optimizely = require('@optimizely/optimizely-sdk');
const defaultLogger = require('@optimizely/optimizely-sdk/lib/plugins/logger');
const LOG_LEVEL = require('@optimizely/optimizely-sdk/lib/utils/enums').LOG_LEVEL;

class OptimizelyManager {
  constructor({ sdkKey, logLevel, ...rest }) {
    let currentDatafile = {};

    logLevel = logLevel || LOG_LEVEL.DEBUG;
    let logger = defaultLogger.createLogger({ logLevel })

    logger.log(LOG_LEVEL.DEBUG, 'MANAGER: Loading Optimizely Manager');
    this.optimizelyClientInstance = {
      isFeatureEnabled() {
        const UNIINITIALIZED_ERROR = `MANAGER: isFeatureEnabled called but Optimizely not yet initialized.

          If you just started a web application or app server, try the request again.

          OR try moving your OptimizelyManager initialization higher in your application startup code
          OR move your isFeatureEnabled call later in your application lifecycle.

          If this error persists, contact Optimizely!
        `;

        logger.log(LOG_LEVEL.ERROR, UNIINITIALIZED_ERROR)
      }
    }

    function pollForDatafile() {
      // Request the datafile every second. If the datafile has changed
      // since the last time we've seen it, then re-instantiate the client
      const DATAFILE_URL = `https://cdn.optimizely.com/datafiles/${sdkKey}.json`;

      request(DATAFILE_URL)
        .then((latestDatafile) => {
          try {
            assert.deepEqual(currentDatafile, latestDatafile)
          } catch (err) {
            logger.log(LOG_LEVEL.DEBUG, 'MANAGER: Received an updated datafile and is re-initializing')
            // The datafile is different! Let's re-instantiate the client
            this.optimizelyClientInstance = optimizely.createInstance({
              datafile: latestDatafile,
              logger,
              ...rest
            });
            currentDatafile = latestDatafile;
          }
        })
    }

    setInterval(pollForDatafile, 1000);
  }

  isFeatureEnabled(featureKey, userId) {
    userId = userId || Math.random().toString()
    return this.optimizelyClientInstance.isFeatureEnabled(featureKey, userId);
  }
}

class Singleton {

  configure(...args) {
    this.instance = new OptimizelyManager(...args);
  }

  getClient() {
    return this.instance;
  }
}

export default new Singleton();
