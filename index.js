'use strict';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

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
 * See the License for the specific language governing permissions and * limitations under the License.
 */

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
 * @param {Object}   options SDK options to be passed to the createInstance method of the SDK
 * @param {string}   options.logLevel Level of the logger used by the manager and the SDK
 * @param {Object}   options.datafileOptions options to control how and when the manager tries to fetch the datafile
 * @param {number}   options.datafileOptions.updateInterval seconds to wait before trying to fetch a new datafile
 * @param {boolean}  options.datafileOptions.liveUpdates when true, the optimizely client will continuously update to the latest datafile available
 * @param {Function} options.datafileOptions.getUrl function which will be given SDK as an argument and should return the url from which datafiles can be fetched
 */
const OptimizelySdk = require('@optimizely/optimizely-sdk');

const {
  DatafileManager
} = require('@optimizely/js-sdk-datafile-manager');

class OptimizelyManager {
  constructor(sdkOptions) {
    let {
      sdkKey,
      datafileOptions,
      datafile,
      logLevel
    } = sdkOptions;
    datafileOptions = datafileOptions || {};
    const manager = new DatafileManager(_objectSpread({
      sdkKey
    }, datafileOptions));
    this.sdkOptions = sdkOptions;
    this.updateInstance(datafile || {}, sdkOptions);
    this.onReady = manager.onReady();
    manager.on('update', () => {
      return this.updateInstance(manager.get());
    });
    manager.onReady().then(() => {
      return this.updateInstance(manager.get());
    });
    manager.start();
  }

  updateInstance(datafile) {
    if (datafile.revision) {
      console.log('Loading Optimizely datafile revision:', datafile.revision);
    } // TODO: enable logging?


    this.optimizelyClientInstance = OptimizelySdk.createInstance(_objectSpread({
      datafile: datafile
    }, this.sdkOptions));
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
    this.instance = new OptimizelyManager(...args);
  }
  /**
   * getClient
   *
   * Get a reference to the singleton optimizely instance
   * @returns {Object} an OptimizelyManager instance
   */


  getClient() {
    if (!this.instance) {
      throw new Error(`OptimizelyManager: You must call .configure() before .getClient()`);
    }

    return this.instance.optimizelyClientInstance;
  }
  /**
   * onReady
   *
   * Indicates when it is safe to use getClient();
   *
   * @returns {Promise} resolved when Optimizely has received a well-formed datafile
   */


  onReady() {
    if (!this.instance) {
      throw new Error(`OptimizelyManager: You must call .configure() before .onReady`);
    }

    return this.instance.onReady;
  }
  /**
   * _reset
   *
   * Resets the singleton instance for testing purposes
   */


  _reset() {
    this.instance = null;
  }

}

module.exports = new Singleton();
