import OptimizelyManager from '../src/main.js'
import OptimizelySdk from '@optimizely/optimizely-sdk'

const fakeDatafile = require('./mock_data/datafile.json');

describe('OptimizelyManager', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllTimers();
    jest.resetAllMocks();
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
        const enabled = optimizely.isFeatureEnabled('checkout_flow', 'user123')
        expect(enabled).toBe(true);
      });
    });
  });
});
