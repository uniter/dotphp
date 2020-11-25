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
    Bootstrapper = require('../../src/Bootstrapper'),
    DotPHP = require('../../src/DotPHP'),
    Evaluator = require('../../src/Evaluator'),
    FileCompiler = require('../../src/FileCompiler'),
    Promise = require('lie'),
    RequireExtension = require('../../src/RequireExtension'),
    StdinReader = require('../../src/StdinReader'),
    Transpiler = require('../../src/Transpiler');

describe('DotPHP', function () {
    var bootstrapper,
        dotPHP,
        evaluator,
        fileCompiler,
        jsBeautify,
        requireExtension,
        stdinReader,
        transpiler;

    beforeEach(function () {
        bootstrapper = sinon.createStubInstance(Bootstrapper);
        evaluator = sinon.createStubInstance(Evaluator);
        fileCompiler = sinon.createStubInstance(FileCompiler);
        jsBeautify = sinon.stub();
        requireExtension = sinon.createStubInstance(RequireExtension);
        stdinReader = sinon.createStubInstance(StdinReader);
        transpiler = sinon.createStubInstance(Transpiler);

        dotPHP = new DotPHP(
            requireExtension,
            fileCompiler,
            bootstrapper,
            evaluator,
            transpiler,
            jsBeautify,
            stdinReader,
            'psync'
        );
    });

    describe('bootstrap()', function () {
        it('should run any bootstraps via the Bootstrapper', function () {
            dotPHP.bootstrap();

            expect(bootstrapper.bootstrap).to.have.been.calledOnce;
        });

        it('should return the Promise returned by the Bootstrapper', function () {
            var promise = sinon.createStubInstance(Promise);
            bootstrapper.bootstrap.returns(promise);

            dotPHP.bootstrap();

            expect(bootstrapper.bootstrap).to.have.been.calledOnce;
        });
    });

    describe('evaluate()', function () {
        it('should ask the Evaluator to evaluate the PHP code', function () {
            dotPHP.evaluate('<?php print "my program";', '/some/module.php');

            expect(evaluator.evaluate).to.have.been.calledOnce;
            expect(evaluator.evaluate).to.have.been.calledWith(
                '<?php print "my program";',
                '/some/module.php'
            );
        });

        it('should return the result from the Evaluator', function () {
            evaluator.evaluate.returns(21);

            expect(dotPHP.evaluate('<?php print "my program";', '/some/module.php')).to.equal(21);
        });
    });

    describe('getMode()', function () {
        it('should return the synchronicity mode', function () {
            expect(dotPHP.getMode()).to.equal('psync');
        });
    });

    describe('readStdin()', function () {
        it('should return the promise from the StdinReader', function () {
            var promise = sinon.createStubInstance(Promise);
            stdinReader.read.returns(promise);

            expect(dotPHP.readStdin()).to.equal(promise);
        });
    });

    describe('register()', function () {
        it('should install the require(...) extension once', function () {
            dotPHP.register();

            expect(requireExtension.install).to.have.been.calledOnce;
        });
    });

    describe('require()', function () {
        it('should ask the FileCompiler to compile the module', function () {
            dotPHP.require('/some/module.php');

            expect(fileCompiler.compile).to.have.been.calledOnce;
            expect(fileCompiler.compile).to.have.been.calledWith('/some/module.php');
        });

        it('should return the module factory from the FileCompiler', function () {
            var moduleFactory = sinon.stub();
            fileCompiler.compile.returns(moduleFactory);

            expect(dotPHP.require('/some/module.php')).to.equal(moduleFactory);
        });
    });

    describe('transpile()', function () {
        beforeEach(function () {
            transpiler.transpile.returns('return "my ugly JS";');
            jsBeautify.withArgs('return "my ugly JS";').returns('return "my pretty JS";');
        });

        it('should transpile the code with its file path', function () {
            dotPHP.transpile('<?php print "my code";', '/path/to/my_module.php');

            expect(transpiler.transpile).to.have.been.calledWith(
                '<?php print "my code";',
                '/path/to/my_module.php'
            );
        });

        it('should beautify the JS code before returning', function () {
            expect(dotPHP.transpile('<?php print "my code";', '/path/to/my_module.php'))
                .to.equal('return "my pretty JS";');
        });

        it('should indent the JS code by 2 spaces when beautifying', function () {
            dotPHP.transpile('<?php print "my code";', '/path/to/my_module.php');

            expect(jsBeautify).to.have.been.calledOnce;
            expect(jsBeautify).to.have.been.calledWith(sinon.match.any, sinon.match({
                'indent_size': 2
            }));
        });
    });
});
