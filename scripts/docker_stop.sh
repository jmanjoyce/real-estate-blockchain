#!/bin/bash


# Docker login credentials
docker_username="jmanjoyce"
docker_password="thev8.1Torcher.2330"
registry_url="https://index.docker.io/v1/"


remote_user="jjoyce"
remote_host="54.204.131.69"  #"13.39.18.95" #root ip #picked a rando one for testing
new_ip=""
ROOT_PORT=8192 #8200?



ssh -o "StrictHostKeyChecking no" "$remote_user@$remote_host" '/bin/bash' <<EOF

docker ps
docker stop \$(docker ps -aq)
docker rm \$(docker ps -aq)
docker network rm blockchain-network

docker ps
EOF