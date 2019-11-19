#!/usr/bin/env bash

command -v systemctl || exit -1
systemctl status clamav-freshclam || systemctl start clamav-freshclam
x=1
while [ ! -f /var/lib/clamav/daily.cld ]
do
    echo -n .
    sleep 1
    ((x++))
    if [ $x -eq 120 ]
    then
        echo Cannot start clamav-daemon
        exit -1
    fi
done
sleep 5
systemctl status clamav-daemon || systemctl start clamav-daemon
