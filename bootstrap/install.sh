#!/bin/bash

apt update

apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    ruby \
    software-properties-common \
    git

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -

add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   $(lsb_release -cs) \
   stable"

apt update

apt-get install -y docker-ce

curl -L "https://github.com/docker/compose/releases/download/1.23.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

chmod +x /usr/local/bin/docker-compose

git clone https://github.com/Aschen/kuzzle-plugin-geofencing-advertising.git

cd kuzzle-plugin-geofencing-advertising

wget https://github.com/codesenberg/bombardier/releases/download/v1.2/bombardier-linux-amd64

chmod +x bombardier-linux-amd64

sysctl -w vm.max_map_count=262144
sysctl -w fs.inotify.max_user_watches=52428

echo "docker-compose -f docker/docker-compose.yml up"
