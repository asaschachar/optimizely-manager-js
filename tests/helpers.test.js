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
      window.localStorage.getItem = jest.fn().mockImplementation((key) => {
          console.log('MOCKED 1')
          return ('{version:4}')
        })
      window.localStorage.setItem= jest.fn().mockImplementation(() => {
          console.log('MOCKED 2')
          return undefined
        })
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

    describe('loadCachedDatafile', () => {
      test('requests the given url using fetch', () => {
        expect(loadCachedDatafile('123')).toBe({ version: 4 })
      });
    });

    describe('cacheDatafile', () => {
      test('requests the given url using fetch', () => {
        cacheDatafile('123', { version: 4 })
        expect(window.localStorage.setItem).lastCalledWith(
          'optimizelyDatafile-123',
          '{version:4}'
        )
      });
    });
  });
});
