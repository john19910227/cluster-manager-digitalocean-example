#!/bin/sh

# set our API key and secret here
cat >> /etc/environment <<EOF
SEKANDO_PROJECT_ID=$1
SEKANDO_API_KEY=$2
SEKANDO_API_SECRET=$3
LC_ALL=en_US.UTF-8
EOF

# download and install the example project repo
mkdir -p /srv
cd /srv
wget https://github.com/sekando/cluster-manager-digitalocean-example/archive/master.tar.gz
tar xpvf master.tar.gz
cd /srv/cluster-manager-digitalocean-example-master
bin/digitalocean/install-load-balancer.sh