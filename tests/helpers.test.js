import {
  fetchJSON,
  loadCachedDatafile,
  cacheDatafile,
} from '../src/helpers.js'

jest.mock('request-promise');
const request = require('request-promise');

describe('helpers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  })

  describe('in node', () => {
    beforeEach(() => {
      request.mockResolvedValue({});
      process.browser = false;
    })

    describe('fetchJSON', () => {
      test('requests the given url', () => {
        fetchJSON('example.com')
        expect(request).lastCalledWith({ uri: 'example.com', json: true })
      });
    });

    describe('loadCachedDatafile', () => {
      test('does not do anything', () => {
        expect(loadCachedDatafile()).toBe(undefined)
      });
    });

    describe('cacheDatafile', () => {
      test('does not do anything', () => {
        expect(cacheDatafile()).toBe(undefined)
      });
    });
  });

  describe('in browser', () => {
    beforeEach(() => {
      window.fetch = jest.fn().mockImplementation(() => Promise.resolve({
        json: () => ({})
      }))
      process.browser = true;
    })

    afterEach(() => {
      process.browser = false;
    })

    describe('fetchJSON', () => {
      test('requests the given url using fetch', () => {
        fetchJSON('example.com')
        expect(window.fetch).lastCalledWith('example.com')
      });
    });

    describe('cacheDatafile', () => {
      test('caches the datafile in localstorage', () => {
        cacheDatafile('123', { version: 4 })
        expect(localStorage.setItem).lastCalledWith(
          'optimizelyDatafile-123',
          '{\"version\":4}'
        )
      });
    });

    describe('loadCachedDatafile', () => {
      beforeEach(() => {
        localStorage.getItem.mockImplementation(() => ('{\"version\":4}'))
      })

      test('returns the datafile stored in localstorage', () => {
        expect(loadCachedDatafile('123')).toEqual({ version: 4 })
      });
    });
  });
});
