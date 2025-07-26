const assert = require('assert');
const app = require('../../src/app');

describe('\'voucher\' service', () => {
  it('registered the service', () => {
    const service = app.service('voucher');

    assert.ok(service, 'Registered the service (voucher)');
  });
});
