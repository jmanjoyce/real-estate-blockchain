#!/bin/bash


# Docker login credentials
docker_username="jmanjoyce"
docker_password="thev8.1Torcher.2330"
registry_url="https://index.docker.io/v1/"


remote_user="amueller"
test_ip_addresses=("15.185.38.199" "157.175.85.120" "18.230.184.226" "18.228.224.70") #("13.40.228.246" "52.47.75.71")
remote_host="13.48.48.239" #"13.40.228.246"

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