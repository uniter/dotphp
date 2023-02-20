/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var builtinsAddon = require('./builtins'),
    evalAddon = require('phpruntime/src/addon/eval'),
    networkAddon = require('phpruntime/src/addon/network'),
    pregAddon = require('phpruntime/src/addon/pcre/basicSupport'),
    streamAddon = require('phpruntime/src/addon/stream');

module.exports = [
    builtinsAddon,
    evalAddon,
    networkAddon,
    pregAddon,
    streamAddon
];
