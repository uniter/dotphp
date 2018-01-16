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
    Mode = require('../../src/Mode'),
    RequireExtension = require('../../src/RequireExtension'),
    Requirer = require('../../src/Requirer');

describe('RequireExtension', function () {
    beforeEach(function () {
        this.module = {
            exports: {}
        };
        this.require = sinon.stub();
        this.requirer = sinon.createStubInstance(Requirer);

        this.require.extensions = {};

        this.extension = new RequireExtension(this.requirer, this.require);
    });

    describe('install()', function () {
        it('should install a require(...) extension for the "php" file extension', function () {
            this.extension.install();

            expect(this.require.extensions['.php']).to.be.a('function');
        });

        describe('the require(...) extension installed', function () {
            it('should ask the Requirer to require the module', function () {
                this.extension.install();

                this.require.extensions['.php'](this.module, '/my/file/path.php');

                expect(this.requirer.require).to.have.been.calledOnce;
                expect(this.requirer.require).to.have.been.calledWith('/my/file/path.php');
            });

            it('should specify asynchronous operation by default', function () {
                this.extension.install();

                this.require.extensions['.php'](this.module, '/my/file/path.php');

                expect(this.requirer.require).to.have.been.calledOnce;
                expect(this.requirer.require.args[0][1]).to.be.an.instanceOf(Mode);
                expect(this.requirer.require.args[0][1].isSynchronous()).to.be.false;
            });

            it('should specify synchronous operation when specified as an option', function () {
                this.extension.install({sync: true});

                this.require.extensions['.php'](this.module, '/my/file/path.php');

                expect(this.requirer.require).to.have.been.calledOnce;
                expect(this.requirer.require.args[0][1]).to.be.an.instanceOf(Mode);
                expect(this.requirer.require.args[0][1].isSynchronous()).to.be.true;
            });

            it('should set the result from the Requirer as module.exports', function () {
                this.requirer.require.returns(21);
                this.extension.install();

                this.require.extensions['.php'](this.module, '/my/file/path.php');

                expect(this.module.exports).to.equal(21);
            });
        });
    });
});
