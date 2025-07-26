const assert = require('assert');
const app = require('../../src/app');

describe('\'cartItems\' service', () => {
  it('registered the service', () => {
    const service = app.service('cartItems');

    assert.ok(service, 'Registered the service (cartItems)');
  });
});
