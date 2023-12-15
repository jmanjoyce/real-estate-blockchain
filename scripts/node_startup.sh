#!/bin/bash

test_ip_addresses=("15.185.38.199" "157.175.85.120") #"18.230.184.226" "18.228.224.70")
#("13.40.228.246" "52.47.75.71")
#test_ip_addresses=$2

# Docker login credentials
docker_username="jmanjoyce"
docker_password="thev8.1Torcher.2330"
registry_url="https://index.docker.io/v1/"


remote_user="amueller"
remote_host="13.48.48.239"   #"13.39.18.95" #root ip #picked a rando one for testing
new_ip=""
ROOT_PORT=8192 #8200?

echo "remote host is $1"

do_node_login(){
  ssh -o "StrictHostKeyChecking no" "$remote_user@$new_ip" '/bin/bash'<<EOF
  docker login \$registry_url -u \$docker_username -p \$docker_password

  # Pull the Docker image
  docker pull jmanjoyce/blockchain-remote:latest

  # Create Docker network --> do we need to do this 
  docker network create blockchain-network

  #run
  #Regular, create block DB?
  docker pull mongo:latest
  # Run MongoDB container
  docker run -d --name mongodb --network blockchain-network -p 8193:27017 mongo

  #docker run -p \$port:3000 --network blockchain-network -e "ROOT_IP=\$remote_host" -e "ROOT_PORT=\$ROOT_PORT" "IP=\$new_ip" "PORT=\$port"  "BLOCK_DB=mongodb:27017/block" "USER_DB=mongodb:27017" jmanjoyce/blockchain-remote:latest &
  #docker run -p \$port:3000 --network blockchain-network -e "ROOT_IP=\$remote_host" -e "ROOT_PORT=\$ROOT_PORT" -e "IP=\$new_ip" -e "PORT=\$port" -e "BLOCK_DB=mongodb:27017/block" -e "USER_DB=$remote_host:8193" jmanjoyce/blockchain-remote:latest &
  mongo --host \$remote_host --port 8193

  docker run -p $port:3000 --network blockchain-network \
    -e "ROOT_IP=$remote_host" \
    -e "ROOT_PORT=$ROOT_PORT" \
    -e "IP=$new_ip" \
    -e "PORT=$port" \
    -e "BLOCK_DB=mongodb:27017/block" \
    -e "USER_DB=$remote_host:8193" \
    jmanjoyce/blockchain-remote:latest &

  echo "run node"
  docker ps
EOF
}

# Path to SSH private key

for ip in "${test_ip_addresses[@]}"; do
    echo "we out here trying $ip"
    # Remote machine details
    new_ip="$ip"
    port="$ROOT_PORT"
    do_node_login &
    echo "node login for ip $new_ip"


done