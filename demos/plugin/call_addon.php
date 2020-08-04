<?php

/*
 * Instantiate the JS-defined class MyAddon, which is defined inside my_addon.js
 * which is specified as an addon under the "addons" section in uniter.phpcore.config.js
 * which in turn is specified as a Uniter platform-level plugin
 * under the "plugins" section in uniter.config.js
 */
$myObject = new MyAddon();

// Defined in my_bootstrap.php, which is specified as a "bootstrap" file
// under the "settings.dotphp.bootstraps" config setting in uniter.config.js
myPrintLine('I am ' . __FILE__ . '.');

// Call the method defined by the JS-defined class
$myObject->myMethod('Hello via plugin!');
