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
    tools = require('./tools');

describe('DotPHP stub option integration - synchronous mode', function () {
    beforeEach(function () {
        tools.init.call(this, __dirname + '/fixtures/sync.stub');
    });

    describe('when requiring a directly stubbed file', function () {
        it('should return null for a stub configured with null', function () {
            expect(
                this.dotPHP.require('/path/to/my/stubbed_null.php')()
                    .execute()
                    .getNative()
            ).to.equal(null);
        });

        it('should not read from the filesystem for a null stub', function () {
            this.dotPHP.require('/path/to/my/stubbed_null.php')().execute();

            expect(this.fs.readFileSync).not.to.have.been.calledWith('/path/to/my/stubbed_null.php');
        });

        it('should return 21 for a stub configured with a PHP string returning 21', function () {
            expect(
                this.dotPHP.require('/path/to/my/stubbed_string.php')()
                    .execute()
                    .getNative()
            ).to.equal(21);
        });

        it('should not read from the filesystem for a string stub', function () {
            this.dotPHP.require('/path/to/my/stubbed_string.php')().execute();

            expect(this.fs.readFileSync).not.to.have.been.calledWith('/path/to/my/stubbed_string.php');
        });

        it('should return 12345 for a stub configured with a number', function () {
            expect(
                this.dotPHP.require('/path/to/my/stubbed_number.php')()
                    .execute()
                    .getNative()
            ).to.equal(12345);
        });

        it('should not read from the filesystem for a number stub', function () {
            this.dotPHP.require('/path/to/my/stubbed_number.php')().execute();

            expect(this.fs.readFileSync).not.to.have.been.calledWith('/path/to/my/stubbed_number.php');
        });

        it('should return true for a stub configured with boolean true', function () {
            expect(
                this.dotPHP.require('/path/to/my/stubbed_bool_true.php')()
                    .execute()
                    .getNative()
            ).to.be.true;
        });

        it('should not read from the filesystem for a boolean true stub', function () {
            this.dotPHP.require('/path/to/my/stubbed_bool_true.php')().execute();

            expect(this.fs.readFileSync).not.to.have.been.calledWith('/path/to/my/stubbed_bool_true.php');
        });

        it('should return false for a stub configured with boolean false', function () {
            expect(
                this.dotPHP.require('/path/to/my/stubbed_bool_false.php')()
                    .execute()
                    .getNative()
            ).to.be.false;
        });

        it('should not read from the filesystem for a boolean false stub', function () {
            this.dotPHP.require('/path/to/my/stubbed_bool_false.php')().execute();

            expect(this.fs.readFileSync).not.to.have.been.calledWith('/path/to/my/stubbed_bool_false.php');
        });
    });

    describe('when requiring a non-stubbed file', function () {
        it('should read the file normally from the filesystem', function () {
            this.fs.readFileSync
                .withArgs('/path/to/my/normal_module.php')
                .returns({toString: sinon.stub().returns('<?php return 999;')});

            expect(
                this.dotPHP.require('/path/to/my/normal_module.php')()
                    .execute()
                    .getNative()
            ).to.equal(999);
            expect(this.fs.readFileSync).to.have.been.calledWith('/path/to/my/normal_module.php');
        });
    });

    describe('when a PHP module requires a stubbed file', function () {
        it('should use the null stub when the included file is configured with null', function () {
            this.fs.readFileSync
                .withArgs('/path/to/my/main_module.php')
                .returns({
                    toString: sinon.stub().returns(
                        '<?php $result = require \'/path/to/my/stubbed_null.php\'; return $result;'
                    )
                });

            expect(
                this.dotPHP.require('/path/to/my/main_module.php')()
                    .execute()
                    .getNative()
            ).to.equal(null);
        });

        it('should not read the stubbed file from the filesystem when it is included by another module', function () {
            this.fs.readFileSync
                .withArgs('/path/to/my/main_module.php')
                .returns({
                    toString: sinon.stub().returns(
                        '<?php require \'/path/to/my/stubbed_null.php\';'
                    )
                });

            this.dotPHP.require('/path/to/my/main_module.php')().execute();

            expect(this.fs.readFileSync).not.to.have.been.calledWith('/path/to/my/stubbed_null.php');
        });

        it('should use the string stub when the included file is configured with a PHP string', function () {
            this.fs.readFileSync
                .withArgs('/path/to/my/main_module.php')
                .returns({
                    toString: sinon.stub().returns(
                        '<?php $result = require \'/path/to/my/stubbed_string.php\'; return $result + 1000;'
                    )
                });

            expect(
                this.dotPHP.require('/path/to/my/main_module.php')()
                    .execute()
                    .getNative()
            ).to.equal(1021);
        });

        it('should use the number stub when the included file is configured with a number', function () {
            this.fs.readFileSync
                .withArgs('/path/to/my/main_module.php')
                .returns({
                    toString: sinon.stub().returns(
                        '<?php $result = require \'/path/to/my/stubbed_number.php\'; return $result;'
                    )
                });

            expect(
                this.dotPHP.require('/path/to/my/main_module.php')()
                    .execute()
                    .getNative()
            ).to.equal(12345);
        });
    });
});
