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
    FileSystem = require('../../src/FileSystem'),
    IncluderFactory = require('../../src/IncluderFactory'),
    Transpiler = require('../../src/Transpiler');

describe('IncluderFactory', function () {
    beforeEach(function () {
        this.fileSystem = sinon.createStubInstance(FileSystem);
        this.fs = {
            readFileSync: sinon.stub().returns({toString: sinon.stub().returns('/* My original PHP */')})
        };
        this.moduleFactory = sinon.stub();
        this.resolve = sinon.stub();
        this.reject = sinon.stub();
        this.promise = {
            resolve: this.resolve,
            reject: this.reject
        };
        this.transpiler = sinon.createStubInstance(Transpiler);

        this.fileSystem.realPath.returns('/my/real/path.php');
        this.transpiler.transpile.returns(this.moduleFactory);

        this.includerFactory = new IncluderFactory(this.fs, this.transpiler);
    });

    describe('create()', function () {
        beforeEach(function () {
            this.callCreate = function () {
                this.includer = this.includerFactory.create(this.fileSystem);
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

            it('should transpile the module\'s code correctly', function () {
                this.callCreate();

                this.includer('/my/module.php', this.promise);

                expect(this.transpiler.transpile).to.have.been.calledOnce;
                expect(this.transpiler.transpile).to.have.been.calledWith(
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

            it('should resolve the promise with the module factory from the transpiler', function () {
                this.callCreate();

                this.includer('/my/module.php', this.promise);

                expect(this.resolve).to.have.been.calledOnce;
                expect(this.resolve).to.have.been.calledWith(sinon.match.same(this.moduleFactory));
            });
        });
    });
});
