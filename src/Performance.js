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
 * Performance option wrapper
 *
 * @param {object} microtime Exports object from the node-microtime library
 * @constructor
 */
function Performance(microtime) {
    /**
     * @type {object} Exports object from the node-microtime library
     */
    this.microtime = microtime;
}

_.extend(Performance.prototype, {
    /**
     * Returns the number of microseconds since the Unix epoch
     *
     * @returns {number}
     */
    getTimeInMicroseconds: function () {
        return this.microtime.now();
    }
});

module.exports = Performance;
