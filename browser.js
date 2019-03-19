'use strict';

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
const request = require('request-promise');
/**
 * OptimizelyManager
 *
 * Creates a convenience wrapper around the Optimizely SDK to provide an out-of-the-box
 * datafile manager to make it easy to install the SDK in your application.
 *
 * The OptimizelyManager is not required to use the Optimizely SDK, but it is
 * available as a convenience to provide helpful defaults.
 *
 * @constructor
 * @param {Object}   sdk An optimizely-sdk object. Install with `npm install --save @optimizely/optimizely-sdk`
 * @param {Object}   options SDK options to be passed to the createInstance method of the SDK
 * @param {string}   options.logLevel Level of the logger used by the manager and the SDK
 * @param {Object}   options.datafileOptions options to control how and when the manager tries to fetch the datafile
 * @param {number}   options.datafileOptions.updateInterval seconds to wait before trying to fetch a new datafile
 * @param {boolean}  options.datafileOptions.liveUpdates when true, the optimizely client will continuously update to the latest datafile available
 * @param {Function} options.datafileOptions.getUrl function which will be given SDK as an argument and should return the url from which datafiles can be fetched
 */


class OptimizelyManager {
  constructor(sdk, {
    sdkKey,
    datafile,
    logLevel,
    datafileOptions,
    ...rest
  }) {
    this.sdk = sdk;
    this.currentDatafile = datafile || {};
    this.logLevel = logLevel || sdk.enums.LOG_LEVEL.DEBUG;
    this.LOG_LEVELS = sdk.enums.LOG_LEVEL;
    const logger = sdk.logging.createLogger({
      logLevel
    });
    this.logger = logger;
    this.sdkOptions = {
      sdkKey,
      logger,
      datafileOptions,
      ...rest
    };
    this.logger.log(this.LOG_LEVELS.DEBUG, 'MANAGER: Loading Optimizely Manager');

    const cachedDatafile = this._loadCachedDatafile(sdkKey);

    this.optimizelyClientInstance = !datafile && !cachedDatafile ? new UninitializedClient(this.logger, this.LOG_LEVELS) : sdk.createInstance({
      datafile: datafile,
      ...this.sdkOptions
    });
    const datafileUrl = datafileOptions && datafileOptions.getUrl ? datafileOptions.getUrl(sdkKey) : this._getDefaultUrl(sdkKey);

    this._requestDatafile(datafileUrl);

    const liveUpdateSetting = datafileOptions && datafileOptions.liveUpdates; // Default liveUpdating to be on in the node environment, not on in the browser environment

    let liveUpdates = !true;

    if (typeof liveUpdateSetting === 'boolean') {
      liveUpdates = liveUpdateSetting;
    }

    if (liveUpdates) {
      const updateInterval = datafileOptions && datafileOptions.updateInterval || 1000;
      setInterval(this._requestDatafile.bind(this, datafileUrl), updateInterval);
    }
  }
  /**
   * Requests the Optimizely datafile from the provided Url
   * @param {string} datafileUrl string identifying the feature. Created in the Optimizely interface
   * @returns {Object} JSON representing the Optimizely datafile
   */


  async _requestDatafile(datafileUrl) {
    let latestDatafile = await this._fetchJSON(datafileUrl);
    const latestRevision = Number(latestDatafile.revision);
    const currentRevision = Number(this.currentDatafile.revision); // TODO: Ensure that the datafile is for the same sdkKey!!! Otherwise may get datafiles which never update

    const isNewDatafile = latestRevision > currentRevision || !this.currentDatafile.revision;

    if (isNewDatafile) {
      this.logger.log(this.LOG_LEVELS.INFO, `MANAGER: Latest datafile revision ${latestRevision}. Current datafile revision ${currentRevision}. Updating Optimizely client with latest feature configuration`);
      this.optimizelyClientInstance = this.sdk.createInstance({
        datafile: latestDatafile,
        ...this.sdkOptions
      });
      this.currentDatafile = latestDatafile;

      this._cacheDatafile(this.sdkOptions.sdkKey, latestDatafile);
    } else {
      this.logger.log(this.LOG_LEVELS.DEBUG, `MANAGER: Latest datafile revision ${latestRevision}. Current datafile revision ${currentRevision}. Not updating Optimizely client.`);
    }

    return this.currentDatafile;
  }
  /**
   * Fetches json from a provided url.
   * Uses the correct package depending on the environment
   * @param {string} url indicating where to fetch json from
   * @returns {Promise} resolved with the json
   */


  _fetchJSON(url) {
    {
      return window.fetch(url).then(response => response.json());
    }
  }
  /**
   * Loads the cached datafile from localStorage in the browser environment
   * Does not do anything in the node environment
   *
   * @param {string} sdkKey helps construct the key of where to cache the datafile in localStorage
   * @returns {JSON} cached datafile JSON
   */


  _loadCachedDatafile(sdkKey) {
    {
      let datafile;

      try {
        datafile = JSON.parse(window.localStorage.getItem(`optimizelyDatafile-${sdkKey}`));
      } catch (error) {
        this.logger.log(this.LOG_LEVELS.DEBUG, `MANAGER: Unable to parse cached datafile json. Try clearing your localStorage. Received error: ${error}`);
      }

      return datafile;
    }
  }
  /**
   * Caches the provided datafile into localStorage in the browser environment
   * Does not do anything in the node environment
   *
   * @param {string} sdkKey helps construct the key of where to cache the datafile in localStorage
   * @param {JSON} datafile to store in localstorage
   */


  _cacheDatafile(sdkKey, datafile) {
    {
      window.localStorage.setItem(`optimizelyDatafile-${sdkKey}`, JSON.stringify(datafile));
    }
  }
  /**
   * isFeatureEnabled
   *
   * Wraps the Optimizely SDK's isFeatureEnabled method with convenient defaults
   *
   * @param {string} featureKey string identifying the feature. Created in the Optimizely interface
   * @param {string} userId unique string identifying the user
   */


  isFeatureEnabled(featureKey, userId) {
    if (!userId) {
      userId = userId || Math.random().toString();
      this.logger.log(this.LOG_LEVELS.INFO, `MANAGER: Using random string '${userId}' for userId. `);
    }

    return this.optimizelyClientInstance.isFeatureEnabled(featureKey, userId);
  }
  /**
   * _getDefaultUrl
   *
   * Provides the standard Optimizely url to the datafile
   *
   * @param {string} sdkKey sdk key for the given project / environment
   */


  _getDefaultUrl(sdkKey) {
    return `https://cdn.optimizely.com/datafiles/${sdkKey}.json`;
  }

}
/**
 * UninitializedClient
 *
 * Class used as an interim client instance until Optimizely is fully initialized
 * available across an application.
 *
 * @constructor
 * @param {Object} options
 * @param {Object} options.logger logger instance
 * @param {Object} options.logLevel log level
 */


class UninitializedClient {
  constructor(logger, logLevels) {
    this.logger = logger;
    this.LOG_LEVELS = logLevels;
  }

  isFeatureEnabled(featureKey, userId) {
    const UNIINITIALIZED_ERROR = `MANAGER: isFeatureEnabled called but Optimizely not yet initialized.

      If you just started a web application or app server, try the request again.

      OR try moving your OptimizelyManager initialization higher in your application startup code
      OR move your isFeatureEnabled call later in your application lifecycle.

      If this error persists, contact Optimizely!
    `;
    this.logger.log(this.LOG_LEVELS.WARNING, UNIINITIALIZED_ERROR);
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
   * @param (same as parameters for the OptimizelyManager above)
   */
  configure(...args) {
    if (!this.sdk) {
      throw new Error(`MANAGER: Configure called without providing an SDK first. Call OptimizelyManager.withSdk(<optimizelySdk>) first.`);
    }

    this.instance = new OptimizelyManager(this.sdk, ...args);
  }
  /**
   * withSdk
   *
   * Indicates to the OptimizelyManager which version of the Optimizely sdk to use
   * @param {Object} sdk An optimizely-sdk object. Install the sdk with `npm install --save @optimizely/optimizely-sdk`
   */


  withSdk(sdk) {
    this.sdk = sdk;
  }
  /**
   * getClient
   *
   * Get a reference to the singleton OptimizelyManager instance
   * @returns {Object} an OptimizelyManager instance
   */


  getClient() {
    return this.instance;
  }

}

var main = new Singleton();

module.exports = main;
