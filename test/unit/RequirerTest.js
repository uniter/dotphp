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
    Evaluator = require('../../src/Evaluator'),
    Requirer = require('../../src/Requirer');

describe('Requirer', function () {
    beforeEach(function () {
        this.evaluator = sinon.createStubInstance(Evaluator);
        this.file = {
            toString: sinon.stub()
        };
        this.fs = {
            readFileSync: sinon.stub().withArgs('/my/module.php').returns(this.file)
        };

        this.requirer = new Requirer(
            this.fs,
            this.evaluator
        );
    });

    describe('require()', function () {
        it('should evaluate the source of the file', function () {
            this.file.toString.returns('<?php print 21;');

            this.requirer.require('/my/module.php');

            expect(this.evaluator.evaluate).to.have.been.calledOnce;
            expect(this.evaluator.evaluate).to.have.been.calledWith('<?php print 21;');
        });

        it('should pass the file path to the Evaluator', function () {
            this.file.toString.returns('<?php print 21;');

            this.requirer.require('/my/module.php');

            expect(this.evaluator.evaluate).to.have.been.calledOnce;
            expect(this.evaluator.evaluate).to.have.been.calledWith(sinon.match.any, '/my/module.php');
        });

        it('should return the result from the Evaluator', function () {
            this.evaluator.evaluate.returns(21);

            expect(this.requirer.require('/my/module.php')).to.equal(21);
        });
    });
});
