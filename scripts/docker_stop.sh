#!/bin/bash


# Docker login credentials
docker_username="jmanjoyce"
docker_password="thev8.1Torcher.2330"
registry_url="https://index.docker.io/v1/"


remote_user="amueller"
#remote_host="13.39.18.95" #root ip #picked a rando one for testing
test_ip_addresses=("13.40.228.246" "52.47.75.71")
remote_host=$1 #"13.40.228.246"

new_ip=""
ROOT_PORT=8192 #8200?



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