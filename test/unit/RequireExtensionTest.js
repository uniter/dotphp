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
    Mode = require('../../src/Mode'),
    RequireExtension = require('../../src/RequireExtension');

describe('RequireExtension', function () {
    var bootstrapper,
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

        bootstrapper.bootstrap.returns(Promise.resolve());

        extension = new RequireExtension(fileCompiler, bootstrapper, require);
    });

    describe('install()', function () {
        describe('when asynchronous operation is specified (the default)', function () {
            it('should install a require(...) extension for the "php" file extension', function () {
                return extension.install(options).then(function () {
                    expect(require.extensions['.php']).to.be.a('function');
                });
            });

            it('should install the require(...) extension after handling any bootstraps', function () {
                return extension.install(options).then(function () {
                    expect(bootstrapper.bootstrap).to.have.been.called;
                });
            });

            describe('the require(...) extension installed', function () {
                it('should ask the FileCompiler to compile the module', function () {
                    return extension.install(options).then(function () {
                        require.extensions['.php'](module, '/my/file/path.php');

                        expect(fileCompiler.compile).to.have.been.calledOnce;
                        expect(fileCompiler.compile).to.have.been.calledWith('/my/file/path.php');
                    });
                });

                it('should specify asynchronous operation', function () {
                    return extension.install(options).then(function () {
                        require.extensions['.php'](module, '/my/file/path.php');

                        expect(fileCompiler.compile).to.have.been.calledOnce;
                        expect(fileCompiler.compile.args[0][1]).to.be.an.instanceOf(Mode);
                        expect(fileCompiler.compile.args[0][1].isSynchronous()).to.be.false;
                    });
                });

                it('should set the result from the Requirer as module.exports', function () {
                    fileCompiler.compile.returns(21);

                    return extension.install(options).then(function () {
                        require.extensions['.php'](module, '/my/file/path.php');

                        expect(module.exports).to.equal(21);
                    });
                });
            });
        });

        describe('when synchronous operation is specified', function () {
            beforeEach(function () {
                options.sync = true;
            });

            it('should install a require(...) extension for the "php" file extension', function () {
                extension.install(options);

                expect(require.extensions['.php']).to.be.a('function');
            });

            it('should install the require(...) extension after handling any bootstraps', function () {
                extension.install(options);

                expect(bootstrapper.bootstrapSync).to.have.been.called;
            });

            describe('the require(...) extension installed', function () {
                it('should ask the FileCompiler to compile the module', function () {
                    extension.install(options);

                    require.extensions['.php'](module, '/my/file/path.php');

                    expect(fileCompiler.compile).to.have.been.calledOnce;
                    expect(fileCompiler.compile).to.have.been.calledWith('/my/file/path.php');
                });

                it('should specify synchronous operation', function () {
                    extension.install(options);

                    require.extensions['.php'](module, '/my/file/path.php');

                    expect(fileCompiler.compile).to.have.been.calledOnce;
                    expect(fileCompiler.compile.args[0][1]).to.be.an.instanceOf(Mode);
                    expect(fileCompiler.compile.args[0][1].isSynchronous()).to.be.true;
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
