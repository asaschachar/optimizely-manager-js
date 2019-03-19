import OptimizelyManager from '../src/main.js'
import OptimizelySdk from '@optimizely/optimizely-sdk'
OptimizelyManager.withSdk(OptimizelySdk);


const fakeDatafile = require('./mock_data/datafile.json');
jest.unmock('../src/helpers');
const helpers = require('../src/helpers');

describe('OptimizelyManager', () => {
  beforeEach(() => {
    if (OptimizelyManager.close) {
      OptimizelyManager.close();
    }
    jest.useFakeTimers();
    jest.runAllTimers();
    jest.resetAllMocks();
    helpers.fetchJSON = jest.fn(() => (fakeDatafile));
  })

  afterEach(() => {
  })

  describe('configure', () => {
    describe('when provided a datafile', () => {
      test('allows immediate access of feature variable', () => {
        OptimizelyManager.configure({
          datafile: fakeDatafile
        })
        const optimizely = OptimizelyManager.getClient();
        const enabled = optimizely.isFeatureEnabled('checkout_flow')
        expect(enabled).toBe(true);
      });
    });

    describe('when provided an sdkKey', () => {
      test('fetches the datafile from the correct url', () => {
        OptimizelyManager.configure({
          sdkKey: '123',
        })
        const optimizely = OptimizelyManager.getClient();
        const enabled = optimizely.isFeatureEnabled('checkout_flow')
        expect(helpers.fetchJSON).lastCalledWith('https://cdn.optimizely.com/datafiles/123.json');
      });
    });

    describe('liveUpdates', () => {
      beforeEach(() => {
        helpers.pollForDatafile = jest.fn(() => (fakeDatafile))
      })

      afterEach(() => {
        helpers.pollForDatafile.mockReset();
      })

      describe('when false', () => {
        test('only fetches the datafile once', () => {
          expect(helpers.pollForDatafile).toHaveBeenCalledTimes(0);
          OptimizelyManager.configure({
            sdkKey: '123',
            datafileOptions: {
              updateInterval: 1000,
              liveUpdates: false,
            }
          })
          expect(helpers.pollForDatafile).toHaveBeenCalledTimes(0);
        });
      })

      describe('when true', () => {
        test('fetches the datafile multiple times', () => {
          expect(helpers.pollForDatafile).toHaveBeenCalledTimes(0);
          OptimizelyManager.configure({
            sdkKey: '123',
            datafileOptions: {
              updateInterval: 1000,
              liveUpdates: true,
            }
          })
          expect(helpers.pollForDatafile).toHaveBeenCalledTimes(1);
        })
      });
    })
  });
});
