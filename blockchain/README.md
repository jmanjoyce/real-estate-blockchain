``` docker-compose build ```

``` docker-compose up blockchain-root ```


## Steps for pushing image to docker

``` docker login ```

```docker build --platform linux/amd64 -t blockchain-remote:latest .```
```docker tag blockchain-remote:latest jmanjoyce/blockchain-remote:latest```
```docker push jmanjoyce/blockchain-remote:latest```

on host machines

```docker pull jmanjoyce/blockchain-remote:latest```
```docker network create blockchain-network```
```docker run -d --name mongodb --network blockchain-network -p 8193:27017 -v /home/jjoyce/mongod.conf mongo```

Root
```docker run -p 8192:3000 --network blockchain-network -e "PORT=8192" -e "IP=54.82.69.8" -e "USER_DB=mongodb:27017" jmanjoyce/blockchain-remote:latest ```


```docker run -p 8192:3000 --network blockchain-network -e "PORT=8192" -e "IP=54.204.131.69" -e "USER_DB=54.82.69.8:8193" -e "ROOT_IP=54.82.69.8" -e "ROOT_PORT=8192" jmanjoyce/blockchain-remote:latest ```

54.204.131.69
54.82.69.8