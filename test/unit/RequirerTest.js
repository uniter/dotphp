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
    Mode = require('../../src/Mode'),
    Requirer = require('../../src/Requirer');

describe('Requirer', function () {
    beforeEach(function () {
        this.compiler = sinon.createStubInstance(Compiler);
        this.file = {
            toString: sinon.stub()
        };
        this.fs = {
            readFileSync: sinon.stub().withArgs('/my/module.php').returns(this.file)
        };
        this.mode = sinon.createStubInstance(Mode);

        this.requirer = new Requirer(
            this.fs,
            this.compiler
        );
    });

    describe('require()', function () {
        it('should compile the source of the file', function () {
            this.file.toString.returns('<?php print 21;');

            this.requirer.require('/my/module.php', this.mode);

            expect(this.compiler.compile).to.have.been.calledOnce;
            expect(this.compiler.compile).to.have.been.calledWith('<?php print 21;');
        });

        it('should pass the file path to the Compiler', function () {
            this.file.toString.returns('<?php print 21;');

            this.requirer.require('/my/module.php', this.mode);

            expect(this.compiler.compile).to.have.been.calledOnce;
            expect(this.compiler.compile).to.have.been.calledWith(sinon.match.any, '/my/module.php');
        });

        it('should pass the Mode through to the Compiler', function () {
            this.file.toString.returns('<?php print 21;');

            this.requirer.require('/my/module.php', this.mode);

            expect(this.compiler.compile).to.have.been.calledOnce;
            expect(this.compiler.compile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match.any,
                sinon.match.same(this.mode)
            );
        });

        it('should return the mode factory from the Compiler', function () {
            var moduleFactory = sinon.stub();

            this.compiler.compile.returns(moduleFactory);

            expect(this.requirer.require('/my/module.php', this.mode)).to.equal(moduleFactory);
        });
    });
});
