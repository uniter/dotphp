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
 * @param {Function} require
 * @constructor
 */
function RequireExtension(requirer, require) {
    /**
     * @type {Requirer}
     */
    this.requirer = requirer;
    /**
     * @type {Function}
     */
    this.require = require;
}

_.extend(RequireExtension.prototype, {
    /**
     * Installs this require(...) extension
     */
    install: function () {
        var extension = this;

        extension.require.extensions['.php'] = function (module, filePath) {
            module.exports = extension.requirer.require(filePath);
        };
    }
});

module.exports = RequireExtension;
