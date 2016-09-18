<?php

namespace Uniter\DotPHP;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;

/**
 * Class Demo
 */
class Demo
{
    /**
     * @var EventDispatcherInterface
     */
    private $eventDispatcher;

    /**
     * @param EventDispatcherInterface $eventDispatcher
     */
    public function __construct(EventDispatcherInterface $eventDispatcher)
    {
        $this->eventDispatcher = $eventDispatcher;
    }

    public function run()
    {
        $this->eventDispatcher->addListener('my.event', function () {
            print 'Hello from listener!' . PHP_EOL;
        });

        $this->eventDispatcher->dispatch('my.event');

        print 'and then' . PHP_EOL;

        $this->eventDispatcher->dispatch('my.event');
    }
}
