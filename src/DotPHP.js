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
 * @param {RequireExtension} requireExtension
 * @param {Requirer} requirer
 * @constructor
 */
function DotPHP(requireExtension, requirer) {
    /**
     * @type {RequireExtension}
     */
    this.requireExtension = requireExtension;
    /**
     * @type {Requirer}
     */
    this.requirer = requirer;
}

_.extend(DotPHP.prototype, {
    /**
     * Registers the `.php` extension handler for Node
     */
    register: function () {
        this.requireExtension.install();
    },

    /**
     * Fetches a PHP module from its full/real path
     *
     * @param {string} path
     * @returns {Value}
     */
    require: function (path) {
        return this.requirer.require(path);
    }
});

module.exports = DotPHP;
