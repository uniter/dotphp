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
    Mode = require('../../src/Mode'),
    Transpiler = require('../../src/Transpiler');

describe('Transpiler', function () {
    beforeEach(function () {
        this.mode = sinon.createStubInstance(Mode);
        this.parserState = {
            setPath: sinon.stub()
        };
        this.phpParser = {
            getState: sinon.stub().returns(this.parserState),
            parse: sinon.stub().returns({name: 'N_PROGRAM'})
        };
        this.phpToJS = {
            transpile: sinon.stub().returns('require("phpruntime").compile();')
        };

        this.transpiler = new Transpiler(this.phpParser, this.phpToJS);
    });

    describe('transpile()', function () {
        it('should set the module\'s path before parsing', function () {
            this.transpiler.transpile('<?php return 21;', '/my/module.php', this.mode);

            expect(this.parserState.setPath).to.have.been.calledOnce;
            expect(this.parserState.setPath).to.have.been.calledWith('/my/module.php');
            expect(this.parserState.setPath).to.have.been.calledBefore(this.phpParser.parse);
        });

        it('should transpile the AST returned by the parser', function () {
            this.transpiler.transpile('<?php return 21;', '/my/module.php', this.mode);

            expect(this.phpToJS.transpile).to.have.been.calledOnce;
            expect(this.phpToJS.transpile).to.have.been.calledWith({name: 'N_PROGRAM'});
        });

        it('should transpile the AST with the correct path', function () {
            this.transpiler.transpile('<?php return 21;', '/my/module.php', this.mode);

            expect(this.phpToJS.transpile).to.have.been.calledOnce;
            expect(this.phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match({path: '/my/module.php'})
            );
        });

        it('should transpile the AST with the asynchronous runtime when mode is asynchronous', function () {
            this.mode.isSynchronous.returns(false);

            this.transpiler.transpile('<?php return 21;', '/my/module.php', this.mode);

            expect(this.phpToJS.transpile).to.have.been.calledOnce;
            expect(this.phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match({sync: false})
            );
        });

        it('should transpile the AST with the synchronous runtime when mode is synchronous', function () {
            this.mode.isSynchronous.returns(true);

            this.transpiler.transpile('<?php return 21;', '/my/module.php', this.mode);

            expect(this.phpToJS.transpile).to.have.been.calledOnce;
            expect(this.phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match({sync: true})
            );
        });

        it('should transpile the AST with the source content for the source map', function () {
            this.transpiler.transpile('<?php return 21;', '/my/module.php', this.mode);

            expect(this.phpToJS.transpile).to.have.been.calledOnce;
            expect(this.phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match({
                    sourceMap: {
                        sourceContent: '<?php return 21;'
                    }
                })
            );
        });

        it('should return the transpiled module JS', function () {
            expect(this.transpiler.transpile('<?php return 21;', '/my/module.php', this.mode))
                .to.equal('require("phpruntime").compile();');
        });
    });
});
