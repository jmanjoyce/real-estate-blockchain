#!/bin/bash

# Array of IP addresses
# ip_addresses=("ip_address1" "ip_address2" "ip_address3")
#london, paris
#test_ip_addresses=("13.40.228.246" "52.47.75.71")

# Docker login credentials
docker_username="jmanjoyce"
docker_password="thev8.1Torcher.2330"
registry_url="https://index.docker.io/v2/"

# root id stuff 
# Remote machine details

remote_user="amueller"
remote_host="13.39.18.95" #root ip #picked a rando one for testing
new_ip=""
ROOT_PORT=8192 #8200?

ssh -o "StrictHostKeyChecking no" "$remote_user@$remote_host" <<EOF
do_root_login(){
    docker login \$registry_url -u \$docker_username -p \$docker_password
    echo "login"
    # Pull the Docker image
    docker pull jmanjoyce/blockchain-remote:latest
    echo "pull"

    # Create Docker network
    docker network create blockchain-network
    echo "create network"

    # Run MongoDB container
    docker run -d --name mongodb --network blockchain-network -p 8193:27017 mongo
    echo "mongodb cont run"
    # Root
    docker run -p $ROOT_PORT:3000 --network blockchain-network -e "PORT=$ROOT_PORT" -e "IP=$remote_host" -e "USER_DB=mongodb:27017" jmanjoyce/blockchain-remote:latest
    echo "run root yay"
}

do_root_login
echo "done root login?\n"

do_node_login(){
  ssh -o "StrictHostKeyChecking no" "$remote_user@$new_ip"<<EOF 

  docker login \$registry_url -u \$docker_username -p \$docker_password

  # Pull the Docker image
  docker pull jmanjoyce/blockchain-remote:latest

  # Create Docker network --> do we need to do this 
  docker network create blockchain-network

  #run

  #Regular
  docker run -p $port:3000 --network blockchain-network -e "PORT=$port" -e "IP=$new_ip" -e "USER_DB=$remote_host:8193" -e "ROOT_IP=$remote_host" -e "ROOT_PORT=$ROOT_PORT" jmanjoyce/blockchain-remote:latest

}

# Path to SSH private key

# for ip in "\${test_ip_addresses[@]}"; do
#     # Remote machine details
#     new_ip="\$ip"
#     port=$ROOT_PORT
#     do_node_login
#     echo "node loginnnn ay slay \$ip\n"

EOF
done