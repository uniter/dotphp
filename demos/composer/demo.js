'use strict';

require('../../register');

require('./demo.php')().execute().catch(function (error) {
    console.error(error);
});
