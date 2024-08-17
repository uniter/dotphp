/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash');

/**
 * @param {FileCompiler} fileCompiler
 * @param {Bootstrapper} bootstrapper
 * @param {Function} require
 * @param {string} mode
 * @constructor
 */
function RequireExtension(fileCompiler, bootstrapper, require, mode) {
    /**
     * @type {Bootstrapper}
     */
    this.bootstrapper = bootstrapper;
    /**
     * @type {FileCompiler}
     */
    this.fileCompiler = fileCompiler;
    /**
     * @type {string}
     */
    this.mode = mode;
    /**
     * @type {Function}
     */
    this.require = require;
}

_.extend(RequireExtension.prototype, {
    /**
     * Installs this require(...) extension. In asynchronous mode, a Promise will be returned
     * that will be fulfilled once the installation is complete (including execution of
     * any bootstrap files). In synchronous mode, null will be returned
     *
     * @returns {Promise|null}
     */
    install: function () {
        var extension = this,
            result;

        function doInstall(result) {
            // Install a handler for Node.js require() of files with ".php" extension,
            // that compiles and executes PHP modules via Uniter
            extension.require.extensions['.php'] = function (module, filePath) {
                module.exports = extension.fileCompiler.compile(filePath);
            };

            return result;
        }

        result = extension.bootstrapper.bootstrap();

        if (extension.mode === 'sync') {
            doInstall();
        } else {
            result = result.then(doInstall);
        }

        return result;
    }
});

module.exports = RequireExtension;
