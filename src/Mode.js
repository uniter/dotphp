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
 * @param {boolean} synchronous
 * @constructor
 */
function Mode(synchronous) {
    /**
     * @type {boolean}
     */
    this.synchronous = synchronous;
}

_.extend(Mode, {
    /**
     * Creates a mode representing asynchronous execution
     *
     * @returns {Mode}
     */
    asynchronous: function () {
        return new Mode(false);
    },

    /**
     * Creates a mode representing synchronous execution
     *
     * @returns {Mode}
     */
    synchronous: function () {
        return new Mode(true);
    }
});

_.extend(Mode.prototype, {
    /**
     * Determines whether the execution mode is synchronous
     *
     * @returns {boolean}
     */
    isSynchronous: function () {
        return this.synchronous;
    }
});

module.exports = Mode;
