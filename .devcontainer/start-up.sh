#!/bin/sh.
sudo sysctl vm.overcommit_memory=1 &&
redis-server .redis.conf
