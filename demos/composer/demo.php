<?php

use Symfony\Component\EventDispatcher\EventDispatcher;
use Uniter\DotPHP\Demo;

require __DIR__ . '/vendor/autoload.php';

print 'Composer demo from ' . __FILE__ . PHP_EOL;

$demo = new Demo(new EventDispatcher());
$demo->run();
