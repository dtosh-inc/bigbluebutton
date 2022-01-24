#!/bin/bash
IP=127.0.0.2
if /sbin/ifconfig lo0 | grep ${IP} ; then
	echo "alias ${IP} is already created"
else
	echo "create alias ${IP}"
	sudo ifconfig lo0 alias ${IP} up
fi

docker container start bbb-dev-01
