/*
 * DotPHP - Require PHP files under Node.js with Uniter
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/uniter/dotphp/
 *
 * Released under the MIT license
 * https://github.com/uniter/dotphp/raw/master/MIT-LICENSE.txt
 */

module.exports = {
    settings: {
        phptojs: {
            mode: 'sync',
        },
        dotphp: {
            stub: {
                '/path/to/my/stubbed_null.php': null,
                '/path/to/my/stubbed_string.php': '<?php return 21;',
                '/path/to/my/stubbed_number.php': 12345,
                '/path/to/my/stubbed_bool_true.php': true,
                '/path/to/my/stubbed_bool_false.php': false,
            },
        },
    },
};
