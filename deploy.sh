#!/bin/bash -x

### ON LOCAL MACHINE

echo [0/4] starting...

echo
echo [1/4] creating tarball...
#git archive -o PodWakeupBot.tgz HEAD
touch PodWakeupBot.tgz  # see https://stackoverflow.com/a/37993307
tar czvf PodWakeupBot.tgz . --exclude=node_modules --exclude=.git --exclude=PodWakeupBot.tgz

echo
echo [2/4] copying tarball to remote server...
scp PodWakeupBot.tgz neptune:/opt/webapps/wakeup/

echo
echo [3/4] cleaning up...
rm PodWakeupBot.tgz


### ON REMOTE SERVER

echo [4/4] running on remote server
ssh neptune "cd /opt/webapps/wakeup/ && tar xzvf PodWakeupBot.tgz"
ssh neptune "cd /opt/webapps/wakeup/ && bash /opt/webapps/wakeup/deploy_step2.sh"

echo
echo done!
