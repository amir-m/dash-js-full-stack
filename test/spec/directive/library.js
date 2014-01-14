'use strict';

describe('Directive: library', function () {

  // load the directive's module
  beforeEach(module('DashbookApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<library></library>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the library directive');
  }));
});
