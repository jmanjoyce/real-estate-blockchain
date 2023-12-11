#!/bin/bash

# Array of IP addresses
# ip_addresses=("ip_address1" "ip_address2" "ip_address3")

# Docker login credentials
docker_username="your_docker_username"
docker_password="your_docker_password"

# root id stuff 
# Remote machine details

remote_user="jjoyce"
remote_host="54.241.136.136" #root ip #picked a rando one for testing 

check_authenticity_prompt() {
  local prompt_text="The authenticity of host"
  local command_output="$("$@" 2>&1)"

  if echo "$command_output" | grep -q "$prompt_text"; then
    # If the prompt is found, respond with "yes"
    echo "Prompt found. Responding with 'yes'."
    yes | "$@"
  else
    # If the prompt is not found, print a message
    echo "No prompt found. Continuing without 'yes'."
  fi
}

# SSH into the remote ROOT machine and execute Docker commands
check_authenticity_prompt ssh "$remote_user@$remote_host" << EOF 


# # Login to Docker 
# echo "$docker_password" | docker login -u "$docker_username" --password-stdin "$docker_registry"

# # Pull the Docker image
# docker pull jmanjoyce/blockchain-remote:latest

# # Create Docker network
# docker network create blockchain-network

# # Run MongoDB container
# docker run -d --name mongodb --network blockchain-network -p 8193:27017 mongo

# #Root
# docker run -p 8192:3000 --network blockchain-network -e "PORT=8192" -e "IP=54.82.69.8" -e "USER_DB=mongodb:27017" jmanjoyce/blockchain-remote:latest


# # Path to SSH private key


# for ip in "${ip_addresses[@]}"; do
#   # Remote machine details
#   remote_user="jjoyce"
#   remote_host="$ip"

#   # SSH into the remote machine and execute Docker commands
#   ssh "$remote_user@$remote_host" << EOF
#     # Login to Docker
#     echo "$docker_password" | docker login -u "$docker_username" --password-stdin "$docker_registry"

#     # Pull the Docker image
#     docker pull jmanjoyce/blockchain-remote:latest

#     # Create Docker network
#     docker network create blockchain-network

#     # Run MongoDB container
#     docker run -d --name mongodb --network blockchain-network -p 8193:27017 mongo

#     #Root
#     docker run -p 8192:3000 --network blockchain-network -e "PORT=8192" -e "IP=54.82.69.8" -e "USER_DB=mongodb:27017" jmanjoyce/blockchain-remote:latest

#     #Regular
#     docker run -p 8192:3000 --network blockchain-network -e "PORT=8192" -e "IP=54.204.131.69" -e "USER_DB=54.82.69.8:8193" -e "ROOT_IP=54.82.69.8" -e "ROOT_PORT=8192" jmanjoyce/blockchain-remote:latest
EOF
done
