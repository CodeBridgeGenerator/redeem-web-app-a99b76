const assert = require('assert');
const app = require('../../src/app');

describe('\'cartItemHistory\' service', () => {
  it('registered the service', () => {
    const service = app.service('cartItemHistory');

    assert.ok(service, 'Registered the service (cartItemHistory)');
  });
});
