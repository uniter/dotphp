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
    asyncRuntime = require('phpruntime/async'),
    fs = require('fs'),
    configLoader = require('phpconfig').createConfigLoader(fs.existsSync),
    syncRuntime = require('phpruntime/sync');

module.exports = new DotPHPFactory(fs, process, configLoader, asyncRuntime, syncRuntime, require);
