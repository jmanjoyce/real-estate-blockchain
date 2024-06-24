``` docker-compose build ```

``` docker-compose up blockchain-root ```


## Steps for pushing image to docker

``` docker login ```

```docker build --platform linux/amd64 -t blockchain-remote:latest .```
```docker tag blockchain-remote:latest jmanjoyce/blockchain-remote:latest```
```docker push image_name```

on host machines

```docker pull jmanjoyce/blockchain-remote:latest```
```docker network create blockchain-network```
```docker run -d --name mongodb --network blockchain-network -p 8193:27017 -v mongod-directory conf mongo```

Root
```docker run -p 8192:3000 --network blockchain-network -e "PORT=8192" -e "IP=ROOT_IP" -e "USER_DB=mongodb:27017" IMAGE_NAME ```

Regulars
```docker run -p 8192:3000 --network blockchain-network -e "PORT=8192" -e "IP=ROOT_IP" -e "USER_DB=USER_DB" -e "ROOT_IP=ROOT_IP" -e "ROOT_PORT=8192" IMAGE_NAME ```

