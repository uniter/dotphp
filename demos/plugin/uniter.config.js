'use strict';

module.exports = {
    plugins: [
        {
            phpcore: __dirname + '/uniter.phpcore.config'
        }
    ],
    settings: {
        dotphp: {
            bootstraps: [__dirname + '/my_bootstrap.php'],
            map: {
                [__dirname + '/replaced_module.php']: __dirname + '/replacing_module.php'
            }
        },
        phpcore: {
            // Test that addon binding options are passed through correctly
            myBinding: {
                myOption: 'my binding option value'
            }
        }
    }
};
