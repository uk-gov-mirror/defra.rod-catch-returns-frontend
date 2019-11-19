#!/usr/bin/env bash

command -v systemctl || exit 0
systemctl status clamav-freshclam || systemctl restart clamav-freshclam
while [ ! -f /var/lib/clamav/daily.cld ]
do
    echo ...
    sleep 1
done
sleep 5
systemctl status clamav-daemon || systemctl restart clamav-daemon
