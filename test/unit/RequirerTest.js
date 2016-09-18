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
    FileSystemFactory = require('../../src/FileSystemFactory'),
    IncluderFactory = require('../../src/IncluderFactory'),
    IO = require('../../src/IO'),
    Requirer = require('../../src/Requirer'),
    Transpiler = require('../../src/Transpiler');

describe('Requirer', function () {
    beforeEach(function () {
        this.compiledModule = sinon.stub();
        this.fileSystemFactory = sinon.createStubInstance(FileSystemFactory);
        this.fs = {
            readFileSync: sinon.stub().returns({toString: sinon.stub().returns('my text')})
        };
        this.includer = sinon.stub();
        this.includerFactory = sinon.createStubInstance(IncluderFactory);
        this.io = sinon.createStubInstance(IO);
        this.phpEngine = {
            execute: sinon.stub()
        };
        this.transpiler = sinon.createStubInstance(Transpiler);

        this.compiledModule.returns(this.phpEngine);
        this.includerFactory.create.returns(this.includer);
        this.transpiler.transpile.returns(this.compiledModule);

        this.requirer = new Requirer(
            this.fs,
            this.transpiler,
            this.io,
            this.fileSystemFactory,
            this.includerFactory
        );
    });

    describe('require()', function () {
        it('should install the IO for the compiled PHP module', function () {
            this.requirer.require('/my/module.php');

            expect(this.io.install).to.have.been.calledOnce;
            expect(this.io.install).to.have.been.calledWith(sinon.match.same(this.phpEngine));
        });

        it('should return the result from executing the module', function () {
            this.phpEngine.execute.returns(21);

            expect(this.requirer.require('/my/module.php')).to.equal(21);
        });
    });
});
