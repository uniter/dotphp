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
 * @param {Object=} replacements
 * @constructor
 */
function PathMapper(replacements) {
    /**
     * @type {Object}
     */
    this.replacements = replacements || {};
}

_.extend(PathMapper.prototype, {
    /**
     * Maps a module path based on config
     *
     * @param {string} path
     * @returns {string}
     */
    map: function (path) {
        var mapper = this;

        return hasOwn.call(mapper.replacements, path) ? mapper.replacements[path] : path;
    }
});

module.exports = PathMapper;
