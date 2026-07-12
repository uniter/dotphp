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
    Stubber = require('../../src/Stubber');

describe('Stubber', function () {
    var stubber;

    beforeEach(function () {
        stubber = new Stubber({
            '/my/stubbed_with_string.php': '<?php return 21;',
            '/my/stubbed_with_null.php': null,
            '/my/stubbed_with_true.php': true,
            '/my/stubbed_with_false.php': false,
            '/my/stubbed_with_number.php': 12345,

            // Make sure we don't rely on inheriting Object.prototype.hasOwnProperty(...).
            'hasOwnProperty': '<?php return "stubbed hasOwnProperty";' // jshint ignore:line
        });
    });

    describe('getStub()', function () {
        it('should return the string PHP code as-is when the stub is a string', function () {
            expect(stubber.getStub('/my/stubbed_with_string.php')).to.equal('<?php return 21;');
        });

        it('should return a null return statement when the stub value is null', function () {
            expect(stubber.getStub('/my/stubbed_with_null.php')).to.equal('<?php return null;');
        });

        it('should return a true return statement when the stub value is true', function () {
            expect(stubber.getStub('/my/stubbed_with_true.php')).to.equal('<?php return true;');
        });

        it('should return a false return statement when the stub value is false', function () {
            expect(stubber.getStub('/my/stubbed_with_false.php')).to.equal('<?php return false;');
        });

        it('should return a numeric return statement when the stub value is a number', function () {
            expect(stubber.getStub('/my/stubbed_with_number.php')).to.equal('<?php return 12345;');
        });

        it('should return null when no stub is configured for the path', function () {
            expect(stubber.getStub('/my/not_stubbed.php')).to.equal(null);
        });

        it('should handle a stub keyed as "hasOwnProperty" without error', function () {
            expect(stubber.getStub('hasOwnProperty')).to.equal('<?php return "stubbed hasOwnProperty";');
        });

        it('should throw for an unsupported stub type', function () {
            var badStubber = new Stubber({
                '/my/bad_stub.php': {unsupported: 'object'}
            });

            expect(function () {
                badStubber.getStub('/my/bad_stub.php');
            }).to.throw(Error, 'Unsupported stub type "object" for file "/my/bad_stub.php"');
        });

        it('should return null when constructed with no stubs argument', function () {
            var emptyStubber = new Stubber();

            expect(emptyStubber.getStub('/any/path.php')).to.equal(null);
        });
    });

    describe('isStubbed()', function () {
        it('should return true when a stub is configured for the path', function () {
            expect(stubber.isStubbed('/my/stubbed_with_string.php')).to.equal(true);
        });

        it('should return true for a null stub', function () {
            expect(stubber.isStubbed('/my/stubbed_with_null.php')).to.equal(true);
        });

        it('should return false when no stub is configured for the path', function () {
            expect(stubber.isStubbed('/my/not_stubbed.php')).to.equal(false);
        });

        it('should handle a stub keyed as "hasOwnProperty" without error', function () {
            expect(stubber.isStubbed('hasOwnProperty')).to.equal(true);
        });

        it('should return false when constructed with no stubs argument', function () {
            var emptyStubber = new Stubber();

            expect(emptyStubber.isStubbed('/any/path.php')).to.equal(false);
        });
    });
});
