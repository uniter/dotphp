/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var DotPHPFactory = require('./src/DotPHPFactory'),
    fs = require('fs');

module.exports = new DotPHPFactory().create(fs, process, require);
