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
    Mode = require('../../src/Mode');

describe('Mode', function () {
    describe('static .asynchronous()', function () {
        it('should return a Mode that indicates asynchronous operation', function () {
            var mode = Mode.asynchronous();

            expect(mode.isSynchronous()).to.be.false;
        });
    });

    describe('static .synchronous()', function () {
        it('should return a Mode that indicates synchronous operation', function () {
            var mode = Mode.synchronous();

            expect(mode.isSynchronous()).to.be.true;
        });
    });

    describe('isSynchronous()', function () {
        it('should return true when expected', function () {
            expect(new Mode(true).isSynchronous()).to.be.true;
        });

        it('should return false when expected', function () {
            expect(new Mode(false).isSynchronous()).to.be.false;
        });
    });
});
