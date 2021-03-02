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
    phpCommon = require('phpcommon'),
    sinon = require('sinon'),
    Compiler = require('../../src/Compiler'),
    Environment = require('phpcore/src/Environment'),
    EnvironmentProvider = require('../../src/EnvironmentProvider'),
    Evaluator = require('../../src/Evaluator'),
    PHPError = phpCommon.PHPError,
    Transpiler = require('../../src/Transpiler');

describe('Evaluator', function () {
    var compiledModule,
        compiler,
        createEvaluator,
        environment,
        environmentProvider,
        evaluator,
        phpEngine,
        result,
        transpiler;

    beforeEach(function () {
        compiledModule = sinon.stub();
        compiler = sinon.createStubInstance(Compiler);
        environment = sinon.createStubInstance(Environment);
        environmentProvider = sinon.createStubInstance(EnvironmentProvider);
        result = {};
        phpEngine = {
            execute: sinon.stub().returns(result)
        };
        transpiler = sinon.createStubInstance(Transpiler);

        compiler.compile.returns(compiledModule);
        compiledModule.returns(phpEngine);

        environmentProvider.getEnvironment
            .withArgs(sinon.match.same(compiler))
            .returns(environment);

        createEvaluator = function (mode) {
            evaluator = new Evaluator(compiler, environmentProvider, mode);
        };
        createEvaluator('async');
    });

    describe('evaluate()', function () {
        it('should compile the code with its file path', function () {
            evaluator.evaluate('<?php print "my program";', '/my/module.php');

            expect(compiler.compile).to.have.been.calledOnce;
            expect(compiler.compile).to.have.been.calledWith(
                '<?php print "my program";',
                '/my/module.php'
            );
        });

        it('should return the result from executing the module', function () {
            expect(evaluator.evaluate('<?php print "my program";', '/my/module.php'))
                .to.equal(result);
        });

        it('should not catch an error thrown in synchronous mode', function () {
            createEvaluator('sync');
            compiler.compile.throws(new Error('Bang'));

            expect(function () {
                evaluator.evaluate('<?php print "my program";', '/my/module.php');
            }.bind(this)).to.throw(Error, 'Bang');
        });

        it('should return a rejected promise when an error is thrown in asynchronous mode', function () {
            compiler.compile.throws(new Error('Bang'));

            return expect(evaluator.evaluate('<?php print "my program";', '/my/module.php'))
                .to.eventually.be.rejectedWith(Error, 'Bang');
        });

        it('should return a rejected promise when an error is thrown in Promise-synchronous mode', function () {
            createEvaluator('psync');
            compiler.compile.throws(new Error('Bang'));

            return expect(evaluator.evaluate('<?php print "my program";', '/my/module.php'))
                .to.eventually.be.rejectedWith(Error, 'Bang');
        });

        it('should report PHPErrors from compilation', function () {
            var phpError = new PHPError(PHPError.E_ERROR, 'Oh dear');
            createEvaluator('sync');
            compiler.compile.throws(phpError);

            try {
                evaluator.evaluate('<?php print "my program";', '/my/module.php');
            } catch (error) {}

            expect(environment.reportError).to.have.been.calledOnce;
            expect(environment.reportError).to.have.been.calledWith(sinon.match.same(phpError));
        });

        it('should rethrow PHPErrors from compilation', function () {
            var phpError = new PHPError(PHPError.E_ERROR, 'Oh dear');
            createEvaluator('sync');
            compiler.compile.throws(phpError);

            expect(function () {
                evaluator.evaluate('<?php print "my program";', '/my/module.php');
            }).to.throw(phpError);
        });

        it('should not report PHPErrors from execution', function () {
            var phpError = new PHPError(PHPError.E_ERROR, 'Oh dear');
            createEvaluator('sync');
            phpEngine.execute
                .throws(phpError);

            try {
                evaluator.evaluate('<?php print "my program";', '/my/module.php');
            } catch (error) {}

            expect(environment.reportError).not.to.have.been.called;
        });

        it('should not catch PHPErrors from compilation in synchronous mode', function () {
            var phpError = new PHPError(PHPError.E_ERROR, 'Oh dear');
            createEvaluator('sync');
            phpEngine.execute
                .throws(phpError);

            expect(function () {
                evaluator.evaluate('<?php print "my program";', '/my/module.php');
            }).to.throw(phpError);
        });

        it('should return a rejected promise when a PHPError is thrown by compilation in asynchronous mode', function () {
            var phpError = new PHPError(PHPError.E_ERROR, 'Oh dear');
            compiler.compile.throws(phpError);

            return expect(evaluator.evaluate('<?php print "my program";', '/my/module.php'))
                .to.eventually.be.rejectedWith(phpError);
        });

        it('should return a rejected promise when a PHPError is thrown by compilation in Promise-synchronous mode', function () {
            var phpError = new PHPError(PHPError.E_ERROR, 'Oh dear');
            createEvaluator('psync');
            compiler.compile.throws(phpError);

            return expect(evaluator.evaluate('<?php print "my program";', '/my/module.php'))
                .to.eventually.be.rejectedWith(phpError);
        });
    });
});
