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
    Compiler = require('../../src/Compiler'),
    FileSystem = require('../../src/FileSystem'),
    IncluderFactory = require('../../src/IncluderFactory'),
    PathMapper = require('../../src/PathMapper');

describe('IncluderFactory', function () {
    var compiler,
        fileSystem,
        fs,
        includerFactory,
        moduleFactory,
        pathMapper,
        promise,
        reject,
        resolve;

    beforeEach(function () {
        compiler = sinon.createStubInstance(Compiler);
        fileSystem = sinon.createStubInstance(FileSystem);
        fs = {
            readFileSync: sinon.stub().returns({toString: sinon.stub().returns('/* My original PHP */')})
        };
        moduleFactory = sinon.stub();
        resolve = sinon.stub();
        reject = sinon.stub();
        pathMapper = sinon.createStubInstance(PathMapper);
        promise = {
            resolve: resolve,
            reject: reject
        };

        fileSystem.realPath
            .withArgs('/my/module.php')
            .returns('/my/real/path.php');
        pathMapper.map
            .withArgs('/my/real/path.php')
            .returns('/my/effective/real/path.php');
        compiler.compile.returns(moduleFactory);

        includerFactory = new IncluderFactory(fs, pathMapper);
    });

    describe('create()', function () {
        var callCreate,
            includer;

        beforeEach(function () {
            callCreate = function () {
                includer = includerFactory.create(compiler, fileSystem);
            };
        });

        it('should return a function', function () {
            callCreate();

            expect(includer).to.be.a('function');
        });

        describe('the function returned', function () {
            it('should read the file from its effective real resolved path', function () {
                callCreate();

                includer('/my/module.php', promise);

                expect(fs.readFileSync).to.have.been.calledOnce;
                expect(fs.readFileSync).to.have.been.calledWith('/my/effective/real/path.php');
            });

            it('should compile the module\'s code correctly', function () {
                callCreate();

                includer('/my/module.php', promise);

                expect(compiler.compile).to.have.been.calledOnce;
                expect(compiler.compile).to.have.been.calledWith(
                    '/* My original PHP */',
                    '/my/real/path.php' // This should _not_ be the mapped/effective path
                );
            });

            it('should reject the promise when an ENOENT SystemError is raised by FileSystem.realPath', function () {
                var error = new Error('Oh dear, the file is unreadable');
                error.code = 'ENOENT';
                fileSystem.realPath
                    .withArgs('/my/module.php')
                    .throws(error);
                callCreate();

                includer('/my/module.php', promise);

                expect(reject).to.have.been.calledOnce;
                expect(reject).to.have.been.calledWith(sinon.match.instanceOf(Error));
                expect(reject.args[0][0].message).to.equal('No such file or directory');
            });

            it('should reject the promise when the file cannot be resolved with FileSystem.realPath for any other reason', function () {
                fileSystem.realPath
                    .withArgs('/my/module.php')
                    .throws(new Error('Oh dear, the file is unreadable'));
                callCreate();

                includer('/my/module.php', promise);

                expect(reject).to.have.been.calledOnce;
                expect(reject).to.have.been.calledWith(sinon.match.instanceOf(Error));
                expect(reject.args[0][0].message).to.equal('Oh dear, the file is unreadable');
            });

            it('should reject the promise when an ENOENT SystemError is raised by readFileSync', function () {
                var error = new Error('Oh dear, the file is unreadable');
                error.code = 'ENOENT';
                fs.readFileSync
                    .withArgs('/my/effective/real/path.php')
                    .throws(error);
                callCreate();

                includer('/my/module.php', promise);

                expect(reject).to.have.been.calledOnce;
                expect(reject).to.have.been.calledWith(sinon.match.instanceOf(Error));
                expect(reject.args[0][0].message).to.equal('No such file or directory');
            });

            it('should reject the promise when the file cannot be read for any other reason', function () {
                fs.readFileSync
                    .withArgs('/my/effective/real/path.php')
                    .throws(new Error('Oh dear, the file is unreadable'));
                callCreate();

                includer('/my/module.php', promise);

                expect(reject).to.have.been.calledOnce;
                expect(reject).to.have.been.calledWith(sinon.match.instanceOf(Error));
                expect(reject.args[0][0].message).to.equal('Oh dear, the file is unreadable');
            });

            it('should resolve the promise with the module factory from the compiler', function () {
                callCreate();

                includer('/my/module.php', promise);

                expect(resolve).to.have.been.calledOnce;
                expect(resolve).to.have.been.calledWith(sinon.match.same(moduleFactory));
            });
        });
    });
});
