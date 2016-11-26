/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var expect = require('chai').expect,
    sinon = require('sinon'),
    Performance = require('../../src/Performance');

describe('Performance', function () {
    beforeEach(function () {
        // Stub version of the Microtime NPM package
        this.microtime = {
            now: sinon.stub()
        };

        this.performance = new Performance(this.microtime);
    });

    describe('getTimeInMicroseconds()', function () {
        it('should return the current time in microseconds', function () {
            this.microtime.now.returns(123123123);

            expect(this.performance.getTimeInMicroseconds()).to.equal(123123123);
        });
    });
});
