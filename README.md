DotPHP
======

[![Build Status](https://secure.travis-ci.org/uniter/dotphp.png?branch=master)](http://travis-ci.org/uniter/dotphp)

Require PHP files from Node.js with [Uniter](https://github.com/asmblah/uniter).

Hooking Uniter into require(...)
--------------------------------
You can install a custom `require(...)` extension that will use Uniter to compile the specified PHP file to JS and include it.

Example:

PHP file `my_module.php`:
```php
<?php

print 'Hello from my_module!';
```

JS file `my_entrypoint.js`:
```javascript
// Register the extension for requiring .php files
require('dotphp/register');

require('./my_module.php');
```

Requiring PHP files without hooking require(...)
------------------------------------------------
You can also require PHP files without interfering with require(...) behaviour by using the `.require(...)` method.

Example:

PHP file `my_module.php`:
```php
<?php

print 'Hello from my_module!';
```

JS file `my_entrypoint.js`:
```javascript
require('dotphp').require('/my_module.php');
```

Keeping up to date
------------------
- [Follow me on Twitter](https://twitter.com/@asmblah) for updates: [https://twitter.com/@asmblah](https://twitter.com/@asmblah)
