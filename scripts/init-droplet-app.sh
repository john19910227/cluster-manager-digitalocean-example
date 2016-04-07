#!/bin/sh

# set our API key and secret here
cat >> /etc/environment <<EOF
SEKANDO_API_KEY="my-key"
SEKANDO_API_SECRET="my-secret"
LC_ALL=en_US.UTF-8
EOF

# download and install the example project repo
mkdir -p /srv
cd /srv
wget https://github.com/sekando/cluster-manager-digitalocean-example/archive/master.tar.gz
tar xpvf master.tar.gz
cd /srv/cluster-manager-digitalocean-example-master
bin/digitalocean/install-app-server.sh
