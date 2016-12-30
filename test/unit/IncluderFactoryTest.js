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
    Mode = require('../../src/Mode');

describe('IncluderFactory', function () {
    beforeEach(function () {
        this.compiler = sinon.createStubInstance(Compiler);
        this.fileSystem = sinon.createStubInstance(FileSystem);
        this.fs = {
            readFileSync: sinon.stub().returns({toString: sinon.stub().returns('/* My original PHP */')})
        };
        this.mode = sinon.createStubInstance(Mode);
        this.moduleFactory = sinon.stub();
        this.resolve = sinon.stub();
        this.reject = sinon.stub();
        this.promise = {
            resolve: this.resolve,
            reject: this.reject
        };

        this.fileSystem.realPath.returns('/my/real/path.php');
        this.compiler.compile.returns(this.moduleFactory);

        this.includerFactory = new IncluderFactory(this.fs);
    });

    describe('create()', function () {
        beforeEach(function () {
            this.callCreate = function () {
                this.includer = this.includerFactory.create(this.compiler, this.fileSystem, this.mode);
            }.bind(this);
        });

        it('should return a function', function () {
            this.callCreate();

            expect(this.includer).to.be.a('function');
        });

        describe('the function returned', function () {
            it('should read the file from its real resolved path', function () {
                this.fileSystem.realPath.withArgs('/my/module.php').returns('/the/real/module/path.php');
                this.callCreate();

                this.includer('/my/module.php', this.promise);

                expect(this.fs.readFileSync).to.have.been.calledOnce;
                expect(this.fs.readFileSync).to.have.been.calledWith('/the/real/module/path.php');
            });

            it('should compile the module\'s code correctly', function () {
                this.callCreate();

                this.includer('/my/module.php', this.promise);

                expect(this.compiler.compile).to.have.been.calledOnce;
                expect(this.compiler.compile).to.have.been.calledWith(
                    '/* My original PHP */',
                    '/my/real/path.php'
                );
            });

            it('should reject the promise when the file cannot be read', function () {
                this.fs.readFileSync.throws(new Error('Oh dear, the file is unreadable'));
                this.callCreate();

                this.includer('/my/module.php', this.promise);

                expect(this.reject).to.have.been.calledOnce;
                expect(this.reject).to.have.been.calledWith(
                    'File "/my/real/path.php" could not be read: Error: Oh dear, the file is unreadable'
                );
            });

            it('should resolve the promise with the module factory from the compiler', function () {
                this.callCreate();

                this.includer('/my/module.php', this.promise);

                expect(this.resolve).to.have.been.calledOnce;
                expect(this.resolve).to.have.been.calledWith(sinon.match.same(this.moduleFactory));
            });
        });
    });
});
