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
 * @param {Requirer} requirer
 * @param {string[]} bootstraps
 * @param {string} mode
 * @constructor
 */
function Bootstrapper(requirer, bootstraps, mode) {
    /**
     * @type {string[]}
     */
    this.bootstraps = bootstraps;
    /**
     * @type {string}
     */
    this.mode = mode;
    /**
     * @type {Requirer}
     */
    this.requirer = requirer;
}

_.extend(Bootstrapper.prototype, {
    /**
     * Requires any bootstrap file(s), if specified in config, in sequence (if multiple are provided).
     * The returned promise will only be resolved once all have completed (or once the first module
     * to reject has done so).
     *
     * @returns {Promise|null}
     */
    bootstrap: function () {
        var bootstrapper = this,
            bootstrapFilePath,
            i,
            // An array of file paths was given - require them in sequence.
            remainingBootstraps = bootstrapper.bootstraps.slice();

        if (bootstrapper.mode === 'sync') {
            for (i = 0; i < remainingBootstraps.length; i++) {
                bootstrapFilePath = remainingBootstraps[i];

                if (bootstrapper.requirer.require(bootstrapFilePath).getType() === 'exit') {
                    // A bootstrap has exited, so do not process any further ones.
                    break;
                }
            }

            return null;
        }

        return new Promise(function (resolve, reject) {
            (function deQueue() {
                var bootstrapFilePath;

                if (remainingBootstraps.length === 0) {
                    // All bootstraps have been required.
                    resolve(null);
                    return;
                }

                // Load the next bootstrap file.
                bootstrapFilePath = remainingBootstraps.shift();

                bootstrapper.requirer
                    .require(bootstrapFilePath)
                    .then(
                        function (resultValue) {
                            if (resultValue.getType() === 'exit') {
                                // A bootstrap has exited, so do not process any further ones.
                                resolve(resultValue);
                                return;
                            }

                            deQueue();
                        },
                        reject
                    );
            })();
        });
    }
});

module.exports = Bootstrapper;
