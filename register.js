/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var path = require('path'),
    // Use the directory of the entrypoint script as the context
    contextDirectory = path.dirname(process.mainModule.filename),

    dotPHP = require('.').create(contextDirectory);

/**
 * Installs PHP support into the current Node.js environment,
 * hooking require(...) to support loading files with ".php" extension
 *
 * @param {Object=} options
 * @return {Promise|null}
 */
module.exports = function (options) {
    return dotPHP.register(options);
};
