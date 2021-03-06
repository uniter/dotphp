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
    Engine = require('phpcore/src/Engine'),
    FileCompiler = require('../../src/FileCompiler'),
    Requirer = require('../../src/Requirer');

describe('Requirer', function () {
    var engine,
        fileCompiler,
        moduleFactory,
        requirer,
        resultPromise;

    beforeEach(function () {
        engine = sinon.createStubInstance(Engine);
        fileCompiler = sinon.createStubInstance(FileCompiler);
        moduleFactory = sinon.stub();
        resultPromise = Promise.resolve();

        fileCompiler.compile.returns(moduleFactory);
        moduleFactory.returns(engine);
        engine.execute.returns(resultPromise);

        requirer = new Requirer(fileCompiler);
    });

    describe('require()', function () {
        it('should compile the file via the FileCompiler', function () {
            requirer.require('/my/module.php');

            expect(fileCompiler.compile).to.have.been.calledOnce;
            expect(fileCompiler.compile).to.have.been.calledWith('/my/module.php');
        });

        it('should return the result from the .execute() method of the module Engine', function () {
            expect(requirer.require('/my/module.php')).to.equal(resultPromise);
        });
    });
});
