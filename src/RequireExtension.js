/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash'),
    Mode = require('./Mode');

/**
 * @param {FileCompiler} fileCompiler
 * @param {Bootstrapper} bootstrapper
 * @param {Function} require
 * @constructor
 */
function RequireExtension(fileCompiler, bootstrapper, require) {
    /**
     * @type {Bootstrapper}
     */
    this.bootstrapper = bootstrapper;
    /**
     * @type {FileCompiler}
     */
    this.fileCompiler = fileCompiler;
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
     * @param {object} options
     * @returns {Promise|null}
     */
    install: function (options) {
        var extension = this,
            sync;

        if (!options) {
            options = {};
        }

        sync = options.sync === true;

        function doInstall() {
            // Install a handler for Node.js require() of files with ".php" extension,
            // that compiles and executes PHP modules via Uniter
            extension.require.extensions['.php'] = function (module, filePath) {
                module.exports = extension.fileCompiler.compile(
                    filePath,
                    sync ? Mode.synchronous() : Mode.asynchronous()
                );
            };
        }

        if (sync) {
            extension.bootstrapper.bootstrapSync();
            doInstall();

            return null;
        }

        return extension.bootstrapper.bootstrap()
            .then(doInstall);
    }
});

module.exports = RequireExtension;
