<?php

// Instantiate the JS-defined class MyPlugin, which is defined inside my_plugin.js
// which is specified as a plugin under the "dotphp.plugins" setting in uniter.config.js
$myObject = new MyPlugin();

// Defined in my_bootstrap.php, which is specified as a "bootstrap" file
// under the "dotphp.bootstraps" config setting in uniter.config.js
myPrintLine('I am ' . __FILE__ . '.');

// Call the method defined by the JS-defined class
$myObject->myMethod('Hello via plugin!');
