'use strict';

describe('Service: DashLoader', function () {

  // load the service's module
  beforeEach(module('DashbookApp'));

  // instantiate service
  var DashLoader;
  beforeEach(inject(function(_DashLoader_) {
    DashLoader = _DashLoader_;
  }));

  it('should do something', function () {
    expect(!!DashLoader).toBe(true);
  });

});
