'use strict';

require('../../register');

require('./print27.php')().execute().catch(function (error) {
    console.error(error);
});
