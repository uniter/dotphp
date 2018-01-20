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
    DotPHP = require('../../src/DotPHP'),
    Evaluator = require('../../src/Evaluator'),
    Mode = require('../../src/Mode'),
    Promise = require('lie'),
    RequireExtension = require('../../src/RequireExtension'),
    Requirer = require('../../src/Requirer'),
    StdinReader = require('../../src/StdinReader'),
    Transpiler = require('../../src/Transpiler');

describe('DotPHP', function () {
    beforeEach(function () {
        this.evaluator = sinon.createStubInstance(Evaluator);
        this.jsBeautify = sinon.stub();
        this.requireExtension = sinon.createStubInstance(RequireExtension);
        this.requirer = sinon.createStubInstance(Requirer);
        this.stdinReader = sinon.createStubInstance(StdinReader);
        this.transpiler = sinon.createStubInstance(Transpiler);

        this.dotPHP = new DotPHP(
            this.requireExtension,
            this.requirer,
            this.evaluator,
            this.transpiler,
            this.jsBeautify,
            this.stdinReader
        );
    });

    describe('evaluate()', function () {
        it('should ask the Evaluator to evaluate the PHP code', function () {
            this.dotPHP.evaluate('<?php print "my program";', '/some/module.php');

            expect(this.evaluator.evaluate).to.have.been.calledOnce;
            expect(this.evaluator.evaluate).to.have.been.calledWith(
                '<?php print "my program";',
                '/some/module.php'
            );
        });

        it('should evaluate the module in asynchronous mode', function () {
            this.dotPHP.evaluate('<?php print "my program";', '/some/module.php');

            expect(this.evaluator.evaluate.args[0][2]).to.be.an.instanceOf(Mode);
            expect(this.evaluator.evaluate.args[0][2].isSynchronous()).to.be.false;
        });

        it('should return the result from the Evaluator', function () {
            this.evaluator.evaluate.returns(21);

            expect(this.dotPHP.evaluate('<?php print "my program";', '/some/module.php')).to.equal(21);
        });
    });

    describe('evaluateSync()', function () {
        it('should ask the Evaluator to evaluate the PHP code', function () {
            this.dotPHP.evaluateSync('<?php print "my program";', '/some/module.php');

            expect(this.evaluator.evaluate).to.have.been.calledOnce;
            expect(this.evaluator.evaluate).to.have.been.calledWith(
                '<?php print "my program";',
                '/some/module.php'
            );
        });

        it('should evaluate the module in synchronous mode', function () {
            this.dotPHP.evaluateSync('<?php print "my program";', '/some/module.php');

            expect(this.evaluator.evaluate.args[0][2]).to.be.an.instanceOf(Mode);
            expect(this.evaluator.evaluate.args[0][2].isSynchronous()).to.be.true;
        });

        it('should return the result from the Evaluator', function () {
            this.evaluator.evaluate.returns(21);

            expect(this.dotPHP.evaluateSync('<?php print "my program";', '/some/module.php')).to.equal(21);
        });
    });

    describe('readStdin()', function () {
        it('should return the promise from the StdinReader', function () {
            var promise = sinon.createStubInstance(Promise);
            this.stdinReader.read.returns(promise);

            expect(this.dotPHP.readStdin()).to.equal(promise);
        });
    });

    describe('register()', function () {
        it('should install the require(...) extension once', function () {
            this.dotPHP.register();

            expect(this.requireExtension.install).to.have.been.calledOnce;
        });
    });

    describe('require()', function () {
        it('should ask the Requirer to require the module', function () {
            this.dotPHP.require('/some/module.php');

            expect(this.requirer.require).to.have.been.calledOnce;
            expect(this.requirer.require).to.have.been.calledWith('/some/module.php');
        });

        it('should require the module in asynchronous mode', function () {
            this.dotPHP.require('/some/module.php');

            expect(this.requirer.require.args[0][1]).to.be.an.instanceOf(Mode);
            expect(this.requirer.require.args[0][1].isSynchronous()).to.be.false;
        });

        it('should return the result from the Requirer', function () {
            this.requirer.require.returns(21);

            expect(this.dotPHP.require('/some/module.php')).to.equal(21);
        });
    });

    describe('requireSync()', function () {
        it('should ask the Requirer to require the module', function () {
            this.dotPHP.requireSync('/some/module.php');

            expect(this.requirer.require).to.have.been.calledOnce;
            expect(this.requirer.require).to.have.been.calledWith('/some/module.php');
        });

        it('should require the module in synchronous mode', function () {
            this.dotPHP.requireSync('/some/module.php');

            expect(this.requirer.require.args[0][1]).to.be.an.instanceOf(Mode);
            expect(this.requirer.require.args[0][1].isSynchronous()).to.be.true;
        });

        it('should return the result from the Requirer', function () {
            this.requirer.require.returns(21);

            expect(this.dotPHP.requireSync('/some/module.php')).to.equal(21);
        });
    });

    describe('transpile()', function () {
        beforeEach(function () {
            this.transpiler.transpile.returns('return "my ugly JS";');
            this.jsBeautify.withArgs('return "my ugly JS";').returns('return "my pretty JS";');
        });

        it('should transpile the code with its file path', function () {
            this.dotPHP.transpile('<?php print "my code";', '/path/to/my_module.php');

            expect(this.transpiler.transpile).to.have.been.calledWith(
                '<?php print "my code";',
                '/path/to/my_module.php'
            );
        });

        it('should transpile the code in asynchronous mode', function () {
            this.dotPHP.transpile('<?php print "my code";', '/path/to/my_module.php');

            expect(this.transpiler.transpile.args[0][2]).to.be.an.instanceOf(Mode);
            expect(this.transpiler.transpile.args[0][2].isSynchronous()).to.be.false;
        });

        it('should beautify the JS code before returning', function () {
            expect(this.dotPHP.transpile('<?php print "my code";', '/path/to/my_module.php'))
                .to.equal('return "my pretty JS";');
        });

        it('should indent the JS code by 2 spaces when beautifying', function () {
            this.dotPHP.transpile('<?php print "my code";', '/path/to/my_module.php');

            expect(this.jsBeautify).to.have.been.calledOnce;
            expect(this.jsBeautify).to.have.been.calledWith(sinon.match.any, sinon.match({
                'indent_size': 2
            }));
        });
    });
});
