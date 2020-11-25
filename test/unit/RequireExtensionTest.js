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

            it('should set the result from the Requirer as module.exports', function () {
                fileCompiler.compile.returns(21);

                return extension.install(options).then(function () {
                    require.extensions['.php'](module, '/my/file/path.php');

                    expect(module.exports).to.equal(21);
                });
            });
        });
    });
});
