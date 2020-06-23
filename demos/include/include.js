'use strict';

require('../../register')()
    .then(function () {
        return require('./calculate_and_print.php')().execute();
    })
    .catch(function (error) {
        console.error(error);
    });
