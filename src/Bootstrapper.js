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
 * @constructor
 */
function Bootstrapper(requirer, bootstraps) {
    /**
     * @type {string[]}
     */
    this.bootstraps = bootstraps;
    /**
     * @type {Requirer}
     */
    this.requirer = requirer;
}

_.extend(Bootstrapper.prototype, {
    /**
     * Requires any bootstrap file(s), if specified in config, in sequence (if multiple are provided).
     * The returned promise will only be resolved once all have completed (or once the first module
     * to reject has done so)
     *
     * @returns {Promise}
     */
    bootstrap: function () {
        var bootstrapper = this;

        return new Promise(function (resolve, reject) {
            var remainingBootstraps;

            // An array of file paths was given - require them in sequence
            remainingBootstraps = bootstrapper.bootstraps.slice();

            (function deQueue() {
                var bootstrapFilePath;

                if (remainingBootstraps.length === 0) {
                    // All bootstraps have been required
                    resolve();
                    return;
                }

                // Load the next bootstrap file
                bootstrapFilePath = remainingBootstraps.shift();

                bootstrapper.requirer
                    .require(bootstrapFilePath)
                    .then(deQueue, reject);
            })();
        });
    }
});

module.exports = Bootstrapper;
