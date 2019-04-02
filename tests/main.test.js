import OptimizelyManager from '../src/main.js'
import OptimizelySdk from '@optimizely/optimizely-sdk'

const fakeDatafile = require('./mock_data/datafile.json');

describe('OptimizelyManager', () => {
  beforeEach(() => {
    OptimizelyManager._reset();
    jest.useFakeTimers();
    jest.clearAllTimers();
    jest.resetAllMocks();
  })

  describe('configure', () => {
    describe('when provided a datafile', () => {
      test('allows immediate access of feature variable', () => {
        OptimizelyManager.configure({
          datafile: fakeDatafile
        })
        const optimizely = OptimizelyManager.getClient();
        const enabled = optimizely.isFeatureEnabled('checkout_flow', 'user123')
        expect(enabled).toBe(true);
      });
    });
  });

  describe('getClient', () => {
    describe('when called before configure', () => {
      test('throws an error', () => {
        expect(() => OptimizelyManager.getClient()).toThrowError();
      });
    });
  });

  describe('onReady', () => {
    describe('when called before configure', () => {
      test('throws an error', () => {
        expect(() => OptimizelyManager.onReady()).toThrowError();
      });
    });

    test('provides a promise', () => {
      OptimizelyManager.configure({
        datafile: fakeDatafile
      })
      const readyPromise = OptimizelyManager.onReady();
      expect(readyPromise).toHaveProperty('then');
    });
  });
});
