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
 * @param {fs} FS module
 * @param {Evaluator} evaluator
 * @constructor
 */
function Requirer(fs, evaluator) {
    /**
     * @type {Evaluator}
     */
    this.evaluator = evaluator;
    /**
     * @type {fs}
     */
    this.fs = fs;
}

_.extend(Requirer.prototype, {
    /**
     * Requires, executes and returns the result of the specified PHP file
     *
     * @param {string} filePath
     * @return {Promise|Value}
     */
    require: function (filePath) {
        var requirer = this,
            phpCode = requirer.fs.readFileSync(filePath).toString();

        return requirer.evaluator.evaluate(phpCode, filePath);
    }
});

module.exports = Requirer;
