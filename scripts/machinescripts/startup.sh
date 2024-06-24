#!/bin/bash

#Script to start up the whole network

# Docker login credentials
docker_username=
docker_password=
registry_url=


remote_user=
remote_host=
new_ip=""
ROOT_PORT=8192 #8200?

ssh -o "StrictHostKeyChecking no" "$remote_user@$remote_host" '/bin/bash' <<EOF1

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
    docker pull mongo:latest
    docker run -d --name mongodb --network blockchain-network -p 8193:27017 mongo 
    echo "mongodb cont run"
    # Root
    docker run -p $ROOT_PORT:3000 --network blockchain-network -e "PORT=$ROOT_PORT" -e "IP=$remote_host" -e "USER_DB=mongodb:27017" -e "BLOCK_DB=mongodb:27017/root" jmanjoyce/blockchain-remote:latest &
    echo "run root yay"
    
}

do_root_login
echo "done root login?"


done
EOF1
