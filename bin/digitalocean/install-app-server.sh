#!/bin/sh
# install dependencies
npm install

# create a service
useradd -m -d /home/nodeapp nodeapp
chown -R nodeapp:nodeapp /srv/cluster-manager-digitalocean-example-master

cat > /etc/init/app-server.conf <<EOF
description "cluster manager test server"
author      "sekando"

start on started mountall
stop on shutdown

# Automatically Respawn:
respawn

script
    cd /srv/cluster-manager-digitalocean-example-master
    exec su nodeapp -c "node app-server.js"
end script

EOF

#start the service
service app-server restart