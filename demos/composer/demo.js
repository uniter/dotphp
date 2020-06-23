'use strict';

require('../../register')()
    .then(function () {
        return require('./demo.php')().execute();
    })
    .catch(function (error) {
        console.error(error);
    });
