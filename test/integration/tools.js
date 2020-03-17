/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var sinon = require('sinon'),
    DotPHPFactory = require('../../src/DotPHPFactory'),
    asyncRuntime = require('phpruntime'),
    syncRuntime = require('phpruntime/sync');

module.exports = {
    init: function () {
        this.fs = {
            readFileSync: sinon.stub(),
            realpathSync: sinon.stub().returnsArg(0)
        };

        this.module = {
            exports: {}
        };

        this.stderrOutput = [];
        this.stdoutOutput = [];

        this.process = {
            cwd: sinon.stub().returns('/a/cwd'),
            stderr: {
                write: sinon.stub().callsFake(function (data) {
                    this.stderrOutput.push(data);
                }.bind(this))
            },
            stdout: {
                write: sinon.stub().callsFake(function (data) {
                    this.stdoutOutput.push(data);
                }.bind(this))
            }
        };

        this.require = sinon.stub();
        this.require.extensions = {};
        this.require.withArgs('phpruntime').returns(asyncRuntime);
        this.require.withArgs('phpruntime/sync').returns(syncRuntime);

        this.dotPHP = new DotPHPFactory().create(
            this.fs,
            this.process,
            asyncRuntime,
            syncRuntime,
            this.require
        );
    }
};
