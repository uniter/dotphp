<?php

// Include the replaced module, but it should be replaced by replacing_module.php
require_once __DIR__ . '/replaced_module.php';

function myPrintLine($message)
{
    print $message . PHP_EOL;
}
