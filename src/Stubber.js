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
    hasOwn = {}.hasOwnProperty;

/**
 * @param {Object=} stubs
 * @constructor
 */
function Stubber(stubs) {
    /**
     * @type {Object}
     */
    this.stubs = stubs || {};
}

_.extend(Stubber.prototype, {
    /**
     * Returns the PHP source code for the stub at the given path, or null if not stubbed.
     * Primitive values (boolean, number, null) are converted to a return statement.
     *
     * @param {string} filePath
     * @returns {string|null}
     */
    getStub: function (filePath) {
        var stub,
            stubber = this;

        if (!hasOwn.call(stubber.stubs, filePath)) {
            return null;
        }

        stub = stubber.stubs[filePath];

        if (typeof stub === 'string') {
            return stub;
        }

        if (typeof stub === 'boolean' || typeof stub === 'number' || stub === null) {
            return '<?php return ' + stub + ';';
        }

        throw new Error(
            'Unsupported stub type "' + typeof stub + '" for file "' + filePath + '"'
        );
    },

    /**
     * Returns whether the given path has a stub configured
     *
     * @param {string} filePath
     * @returns {boolean}
     */
    isStubbed: function (filePath) {
        var stubber = this;

        return hasOwn.call(stubber.stubs, filePath);
    }
});

module.exports = Stubber;
