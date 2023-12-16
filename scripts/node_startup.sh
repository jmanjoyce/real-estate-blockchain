#!/bin/bash

#test_ip_addresses=('3.89.231.167' '54.204.131.69' '34.228.197.147' '3.135.204.68' '54.241.136.136' '15.185.38.199' '157.175.85.120' '34.245.77.164')
# test_ip_addresses=(
#     '3.89.231.167' '54.204.131.69' '34.228.197.147'
#     '3.135.204.68' '54.241.136.136' '54.153.41.121'
#     '34.217.13.50' '52.25.77.13' '13.245.150.107'
#     '3.10.51.103' '54.180.82.204' '54.169.70.132'
#     '18.136.201.21' '3.26.52.227' '3.27.82.43'
#     '13.114.101.52' '3.112.237.22' '3.99.152.205'
#     '15.156.205.154' '18.192.57.65'
# )

#15
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
#("15.185.38.199" "157.175.85.120") #"18.230.184.226" "18.228.224.70")
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