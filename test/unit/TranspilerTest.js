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
    Transpiler = require('../../src/Transpiler');

describe('Transpiler', function () {
    var createTranspiler,
        parserState,
        phpParser,
        phpToJS,
        phpToJSConfig,
        transpiler,
        transpilerConfig;

    beforeEach(function () {
        parserState = {
            setPath: sinon.stub()
        };
        phpParser = {
            getState: sinon.stub().returns(parserState),
            parse: sinon.stub().returns({name: 'N_PROGRAM'})
        };
        phpToJS = {
            transpile: sinon.stub().returns('require("phpruntime").compile();')
        };
        phpToJSConfig = {
            'my': 'PHPToJS config'
        };
        transpilerConfig = {
            'my': 'Transpiler config'
        };

        createTranspiler = function (mode) {
            transpiler = new Transpiler(phpParser, phpToJS, transpilerConfig, phpToJSConfig, mode);
        };
        createTranspiler('async');
    });

    describe('transpile()', function () {
        it('should set the module\'s path before parsing', function () {
            transpiler.transpile('<?php return 21;', '/my/module.php');

            expect(parserState.setPath).to.have.been.calledOnce;
            expect(parserState.setPath).to.have.been.calledWith('/my/module.php');
            expect(parserState.setPath).to.have.been.calledBefore(phpParser.parse);
        });

        it('should transpile the AST returned by the parser', function () {
            transpiler.transpile('<?php return 21;', '/my/module.php');

            expect(phpToJS.transpile).to.have.been.calledOnce;
            expect(phpToJS.transpile).to.have.been.calledWith({name: 'N_PROGRAM'});
        });

        it('should transpile the AST with the correct path', function () {
            transpiler.transpile('<?php return 21;', '/my/module.php');

            expect(phpToJS.transpile).to.have.been.calledOnce;
            expect(phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match({path: '/my/module.php'})
            );
        });

        it('should transpile the AST with the asynchronous runtime when mode is asynchronous', function () {
            transpiler.transpile('<?php return 21;', '/my/module.php');

            expect(phpToJS.transpile).to.have.been.calledOnce;
            expect(phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match({mode: 'async'})
            );
        });

        it('should transpile the AST with the Promise-synchronous runtime when mode is Promise-synchronous', function () {
            createTranspiler('psync');

            transpiler.transpile('<?php return 21;', '/my/module.php');

            expect(phpToJS.transpile).to.have.been.calledOnce;
            expect(phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match({mode: 'psync'})
            );
        });

        it('should transpile the AST with the synchronous runtime when mode is synchronous', function () {
            createTranspiler('sync');

            transpiler.transpile('<?php return 21;', '/my/module.php');

            expect(phpToJS.transpile).to.have.been.calledOnce;
            expect(phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match({mode: 'sync'})
            );
        });

        it('should transpile the AST with the source content for the source map', function () {
            transpiler.transpile('<?php return 21;', '/my/module.php');

            expect(phpToJS.transpile).to.have.been.calledOnce;
            expect(phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match({
                    sourceMap: {
                        sourceContent: '<?php return 21;'
                    }
                })
            );
        });

        it('should transpile the AST with line numbers enabled', function () {
            transpiler.transpile('<?php return 21;', '/my/module.php');

            expect(phpToJS.transpile).to.have.been.calledOnce;
            expect(phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match({
                    lineNumbers: true
                })
            );
        });

        it('should add any custom PHPToJS config', function () {
            transpiler.transpile('<?php return 21;', '/my/module.php');

            expect(phpToJS.transpile).to.have.been.calledOnce;
            expect(phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match({
                    my: 'PHPToJS config'
                })
            );
        });

        it('should add any custom Transpiler config', function () {
            transpiler.transpile('<?php return 21;', '/my/module.php');

            expect(phpToJS.transpile).to.have.been.calledOnce;
            expect(phpToJS.transpile).to.have.been.calledWith(
                sinon.match.any,
                sinon.match.any,
                sinon.match({
                    my: 'Transpiler config'
                })
            );
        });

        it('should return the transpiled module JS', function () {
            expect(transpiler.transpile('<?php return 21;', '/my/module.php'))
                .to.equal('require("phpruntime").compile();');
        });
    });
});
