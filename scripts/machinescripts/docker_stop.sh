#!/bin/bash

#This scripts closes and removes docker images from all machines

# Docker login credentials
docker_username=
docker_password=
registry_url="https://index.docker.io/v1/"

#add user information to create test ip info
remote_user=
test_ip_addresses=("" "" "" "") 
remote_host="" 

new_ip=""
ROOT_PORT=



ssh -o "StrictHostKeyChecking no" "$remote_user@$remote_host" '/bin/bash' <<EOF1

docker ps
docker stop \$(docker ps -aq)
docker rm \$(docker ps -aq)
docker network rm blockchain-network
docker ps
EOF1


delete_each(){
    ssh -o "StrictHostKeyChecking no" "$remote_user@$new_ip" '/bin/bash' <<EOF

    #docker ps
    docker stop \$(docker ps -aq)
    docker rm \$(docker ps -aq)
    docker network rm blockchain-network
    #docker ps
EOF
}

for ip in "${test_ip_addresses[@]}"; do
    new_ip=$ip
    delete_each

done