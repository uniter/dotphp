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
    DotPHP = require('../../src/DotPHP'),
    RequireExtension = require('../../src/RequireExtension'),
    Requirer = require('../../src/Requirer');

describe('DotPHP', function () {
    beforeEach(function () {
        this.requireExtension = sinon.createStubInstance(RequireExtension);
        this.requirer = sinon.createStubInstance(Requirer);

        this.dotPHP = new DotPHP(this.requireExtension, this.requirer);
    });

    describe('register()', function () {
        it('should install the require(...) extension once', function () {
            this.dotPHP.register();

            expect(this.requireExtension.install).to.have.been.calledOnce;
        });
    });

    describe('require()', function () {
        it('should ask the Requirer to require the module', function () {
            this.dotPHP.require('/some/module.php');

            expect(this.requirer.require).to.have.been.calledOnce;
            expect(this.requirer.require).to.have.been.calledWith('/some/module.php');
        });

        it('should return the result from the Requirer', function () {
            this.requirer.require.returns(21);

            expect(this.dotPHP.require('/some/module.php')).to.equal(21);
        });
    });
});
