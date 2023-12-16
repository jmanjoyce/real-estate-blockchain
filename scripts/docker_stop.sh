#!/bin/bash


# Docker login credentials
docker_username="jmanjoyce"
docker_password="thev8.1Torcher.2330"
registry_url="https://index.docker.io/v1/"


remote_user="amueller"
test_ip_addresses=(
    '51.17.24.10' '51.17.168.219'
    '3.28.44.128' '3.29.126.32' '15.161.56.73'
    '15.160.247.27' '52.47.75.71' '13.39.18.95'
    '51.20.98.34' '13.48.48.239' '15.185.38.199'
    '157.175.85.120' '18.230.184.226' '18.228.224.70'
    '13.246.232.5'
)
# test_ip_addresses=(
#     '107.23.192.217' '51.17.24.10' '51.17.168.219'
#     '3.28.44.128' '3.29.126.32' '15.161.56.73'
#     '15.160.247.27' '52.47.75.71' '13.39.18.95'
#     '51.20.98.34' '13.48.48.239' '15.185.38.199'
#     '157.175.85.120' '18.230.184.226' '18.228.224.70'
#     '13.246.232.5' '18.166.58.233' '18.163.35.20'
#     '108.137.2.253' '108.136.135.181' '3.110.118.143'
#     '3.111.39.82' '15.152.54.178' '13.208.251.78'
#     '54.180.122.185'
# )

#=("15.185.38.199" "157.175.85.120" "18.230.184.226" "18.228.224.70") #("13.40.228.246" "52.47.75.71")
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