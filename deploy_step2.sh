#!/bin/bash -x

echo
echo [1/5] unpacking
cd /opt/webapps/wakeup/
tar xzvf PodWakeupBot.tgz

echo
echo [2/5] installing modules
npm install

echo
echo [3/5] preparing production config file...
cp .env.prod .env
cp credentials.json.prod credentials.json
cp token.json.prod token.json

echo
echo [4/5] stopping running bot...
pm2 stop PodWakeupBot

echo
echo [5/5] starting updated bout...
pm2 start index.js --name=PodWakeupBot --log-date-format="YYYY-MM-DD HH:mm:ss.SSS Z"
