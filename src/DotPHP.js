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
 * @param {Evaluator} evaluator
 * @constructor
 */
function DotPHP(requireExtension, requirer, evaluator) {
    /**
     * @type {Evaluator}
     */
    this.evaluator = evaluator;
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
     * Executes and returns the result of the specified PHP code
     *
     * @param {string} phpCode
     * @param {string} filePath
     * @returns {Promise|Value}
     */
    evaluate: function (phpCode, filePath) {
        return this.evaluator.evaluate(phpCode, filePath);
    },

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
