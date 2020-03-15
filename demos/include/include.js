'use strict';

require('../../register');

require('./calculate_and_print.php')().execute().catch(function (error) {
    console.error(error);
});
