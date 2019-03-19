/**
 * Fetches json from a provided url.
 * Uses the correct package depending on the environment
 * @param {string} url indicating where to fetch json from
 * @returns {Promise} resolved with the json
 */
export const fetchJSON = (url) => {
  if (process.browser) {
    return window.fetch(url).then((response) => (response.json()))
  } else {
    const request = require('request-promise');
    return request({ uri: url, json: true })
  }
}

/**
 * Loads the cached datafile from localStorage in the browser environment
 * Does not do anything in the node environment
 *
 * @param {string} sdkKey helps construct the key of where to cache the datafile in localStorage
 * @returns {JSON} cached datafile JSON
 */
export const loadCachedDatafile = (sdkKey) => {
  if (process.browser) {
    return JSON.parse(window.localStorage.getItem(`optimizelyDatafile-${sdkKey}`))
  }
}

/**
 * Caches the provided datafile into localStorage in the browser environment
 * Does not do anything in the node environment
 *
 * @param {string} sdkKey helps construct the key of where to cache the datafile in localStorage
 * @param {JSON} datafile to store in localstorage
 */
export const cacheDatafile = (sdkKey, datafile) => {
  if (process.browser) {
    window.localStorage.setItem(`optimizelyDatafile-${sdkKey}`, JSON.stringify(datafile))
  }
}

/**
 * getDefaultUrl
 *
 * Provides the standard Optimizely url to the datafile
 *
 * @param {string} sdkKey sdk key for the given project / environment
 */
export const getDefaultUrl = (sdkKey) => {
  return `https://cdn.optimizely.com/datafiles/${sdkKey}.json`;
}

/**
 * pollForDatafile
 *
 * Wrapper around setInterval for testing purposes
 */
export const pollForDatafile = (callback, interval) => {
  return setInterval(callback, interval)
}
