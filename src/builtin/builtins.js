/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

var networkBindings = require('./bindings/network'),
    networkInitialisers = require('./initialisers/network');

module.exports = {
    bindingGroups: [
        networkBindings
    ],
    initialiserGroups: [
        networkInitialisers
    ]
};
