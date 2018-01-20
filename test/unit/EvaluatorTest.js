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
    Evaluator = require('../../src/Evaluator'),
    Mode = require('../../src/Mode'),
    Transpiler = require('../../src/Transpiler');

describe('Evaluator', function () {
    beforeEach(function () {
        this.compiledModule = sinon.stub();
        this.compiler = sinon.createStubInstance(Compiler);
        this.mode = sinon.createStubInstance(Mode);
        this.result = {};
        this.phpEngine = {
            execute: sinon.stub().returns(this.result)
        };
        this.transpiler = sinon.createStubInstance(Transpiler);

        this.compiler.compile.returns(this.compiledModule);
        this.compiledModule.returns(this.phpEngine);

        this.mode.isSynchronous.returns(false);

        this.evaluator = new Evaluator(this.compiler);
    });

    describe('evaluate()', function () {
        it('should compile the code with its file path', function () {
            this.evaluator.evaluate('<?php print "my program";', '/my/module.php', this.mode);

            expect(this.compiler.compile).to.have.been.calledOnce;
            expect(this.compiler.compile).to.have.been.calledWith(
                '<?php print "my program";',
                '/my/module.php'
            );
        });

        it('should pass the mode through when compiling the code', function () {
            this.evaluator.evaluate('<?php print "my program";', '/my/module.php', this.mode);

            expect(this.compiler.compile).to.have.been.calledOnce;
            expect(this.compiler.compile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match.any,
                sinon.match.same(this.mode)
            );
        });

        it('should return the result from executing the module', function () {
            expect(this.evaluator.evaluate('<?php print "my program";', '/my/module.php', this.mode))
                .to.equal(this.result);
        });

        it('should not catch an error thrown in synchronous mode', function () {
            this.mode.isSynchronous.returns(true);
            this.compiler.compile.throws(new Error('Bang'));

            expect(function () {
                this.evaluator.evaluate('<?php print "my program";', '/my/module.php', this.mode);
            }.bind(this)).to.throw(Error, 'Bang');
        });

        it('should return a rejected promise when an error is thrown in asynchronous mode', function () {
            this.compiler.compile.throws(new Error('Bang'));

            expect(this.evaluator.evaluate('<?php print "my program";', '/my/module.php', this.mode))
                .to.eventually.be.rejectedWith(Error, 'Bang');
        });
    });
});
