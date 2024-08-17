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
    Bootstrapper = require('../../src/Bootstrapper'),
    FileCompiler = require('../../src/FileCompiler'),
    RequireExtension = require('../../src/RequireExtension');

describe('RequireExtension', function () {
    var bootstrapper,
        createExtension,
        extension,
        fileCompiler,
        module,
        options,
        require;

    beforeEach(function () {
        bootstrapper = sinon.createStubInstance(Bootstrapper);
        fileCompiler = sinon.createStubInstance(FileCompiler);
        module = {
            exports: {}
        };
        options = {};
        require = sinon.stub();

        require.extensions = {};

        createExtension = function (mode) {
            extension = new RequireExtension(fileCompiler, bootstrapper, require, mode);
        };
        createExtension('async');
    });

    describe('install()', function () {
        describe('in async mode', function () {
            beforeEach(function () {
                bootstrapper.bootstrap.returns(Promise.resolve('my result'));
            });

            it('should install a require(...) extension for the "php" file extension', async function () {
                await extension.install(options);

                expect(require.extensions['.php']).to.be.a('function');
            });

            it('should install the require(...) extension after handling any bootstraps', async function () {
                await extension.install(options);

                expect(bootstrapper.bootstrap).to.have.been.called;
            });

            it('should resolve with the bootstrap result', async function () {
                expect(await extension.install(options)).to.equal('my result');
            });

            describe('the require(...) extension installed', function () {
                it('should ask the FileCompiler to compile the module', async function () {
                    await extension.install(options);

                    require.extensions['.php'](module, '/my/file/path.php');

                    expect(fileCompiler.compile).to.have.been.calledOnce;
                    expect(fileCompiler.compile).to.have.been.calledWith('/my/file/path.php');
                });

                it('should set the result from the Requirer as module.exports', async function () {
                    fileCompiler.compile.returns(21);

                    await extension.install(options);
                    require.extensions['.php'](module, '/my/file/path.php');

                    expect(module.exports).to.equal(21);
                });
            });
        });

        describe('in sync mode', function () {
            beforeEach(function () {
                bootstrapper.bootstrap.returns('my result');

                createExtension('sync');
            });

            it('should install a require(...) extension for the "php" file extension', function () {
                extension.install(options);

                expect(require.extensions['.php']).to.be.a('function');
            });

            it('should install the require(...) extension after handling any bootstraps', function () {
                extension.install(options);

                expect(bootstrapper.bootstrap).to.have.been.called;
            });

            it('should return the bootstrap result', async function () {
                expect(extension.install(options)).to.equal('my result');
            });

            describe('the require(...) extension installed', function () {
                it('should ask the FileCompiler to compile the module', function () {
                    extension.install(options);

                    require.extensions['.php'](module, '/my/file/path.php');

                    expect(fileCompiler.compile).to.have.been.calledOnce;
                    expect(fileCompiler.compile).to.have.been.calledWith('/my/file/path.php');
                });

                it('should set the result from the Requirer as module.exports', function () {
                    fileCompiler.compile.returns(21);
                    extension.install(options);

                    require.extensions['.php'](module, '/my/file/path.php');

                    expect(module.exports).to.equal(21);
                });
            });
        });
    });
});
