/**
 * Copyright 2016-2017, Optimizely
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const request = require('request-promise'); // TODO: DEPENDS ON NODE
const assert = require('assert'); // TODO: DEPENDS ON NODE 
const optimizelySdk = require('@optimizely/optimizely-sdk');
const defaultLogger = require('@optimizely/optimizely-sdk/lib/plugins/logger');
const LOG_LEVEL = require('@optimizely/optimizely-sdk/lib/utils/enums').LOG_LEVEL;

/**
 * OptimizelyManager
 *
 * Creates a convenience wrapper around the Optimizely SDK to provide an out-of-the-box
 * datafile manager to make it easy to install the SDK in your application.
 *
 * The OptimizelyManager is not required to use the Optimizely SDK, but it is
 * available as a convenience to provide helpful defaults.
 *
 * @param {Object} sdk An optimizely-sdk object. Install with `npm install --save @optimizely/optimizely-sdk`
 * @param {Object} options SDK options to be passed to the createInstance method of the SDK
 * @param {String} options.logLevel Level of the logger used by the manager and the SDK
 * @param {Object} options.datafileOptions options to control how and when the manager tries to fetch the datafile
 * @param {Integer} options.datafileOptions.pollingInterval seconds to wait before trying to fetcha new datafile
 */
class OptimizelyManager {
  constructor(sdk, { sdkKey, logLevel, datafileOptions, ...rest }) {
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
            logger.log(LOG_LEVEL.DEBUG, 'MANAGER: Received an updated datafile. Re-initializing client with latest feature flag settings')
            this.optimizelyClientInstance = sdk.createInstance({
              datafile: latestDatafile,
              logger,
              ...rest
            });
            currentDatafile = latestDatafile;
            resolve(currentDatafile)
          }
        })
    }

    const interval = datafileOptions && datafileOptions.pollingInterval || 1000
    setInterval(pollForDatafile, datafileOptions.pollingInterval);
  }

  /**
   * isFeatureEnabled
   *
   * Wraps the Optimizely SDK's isFeatureEnabled method with convenient defaults
   *
   * @params {string} featureKey string identifying the feature. Created in the Optimizely interface
   * @params {string} userId unique string identifying the user
   */
  isFeatureEnabled(featureKey, userId) {
    if (!userId) {
      userId = userId || Math.random().toString()
      logger.log(LOG_LEVEL.INFO, `MANAGER: Using random string '${userId}' for userId. `)
    }

    return this.optimizelyClientInstance.isFeatureEnabled(featureKey, userId);
  }
}

/**
 * Singleton
 *
 * Class used to create a single instance of the Optimizely Manager to make the manager conveniently
 * available across an application.
 */
class Singleton {
  /**
   * configure
   *
   * Configures the Optimizely SDK with the provided settings.
   *
   * @params (same as parameters for the OptimizelyManager above
   */
  configure(...args) {
    if (!this.sdk) {
      throw new Error(`MANAGER: Configure called without providing an SDK first. Call OptimizelyManager.withSdk(<optimizelySdk>) first.`)
    }
    this.instance = new OptimizelyManager(this.sdk, ...args);
  }

  /**
   * withSdk
   *
   * Indicates to the OptimizelyManager which version of the Optimizely sdk to use
   * @param {Object} sdk An optimizely-sdk object. Install with `npm install --save @optimizely/optimizely-sdk`
   */
  withSdk(sdk) {
    this.sdk = sdk;
  }

  /**
   * getClient
   *
   * Get a reference to the singleton OptimizelyManager instance
   * @returns an OptimizelyManager instance
   */
  getClient() {
    return this.instance;
  }
}

export default new Singleton();
