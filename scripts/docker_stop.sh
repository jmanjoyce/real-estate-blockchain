#!/bin/bash


# Docker login credentials
docker_username="jmanjoyce"
docker_password="thev8.1Torcher.2330"
registry_url="https://index.docker.io/v2/"


remote_user="amueller"
remote_host="13.39.18.95" #root ip #picked a rando one for testing
new_ip=""
ROOT_PORT=8192 #8200?


docker stop $(docker ps -aq)
echo "stop"
docker rm $(docker ps -a -q)
echo "rm"
docker network rm blockchain-network
echo "rm netty"

# Verify if everything has stopped
if [ -z "$(docker ps -q)" ]; then
    echo "All Docker containers have been stopped and removed successfully."
else
    echo "Failed to stop or remove all Docker containers."
fi