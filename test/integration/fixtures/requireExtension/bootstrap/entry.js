/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

'use strict';

(async () => {
    await require('../../../../../register')();

    console.log('I should not be reached');
})().catch((error) => {
    console.log('ERROR: ' + error);
});
