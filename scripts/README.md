# How to run the automation scripts!

In order to easily run many nodes and perform testing, we automated the stopping and starting of the docker containers on various machines.
Before you start, pick an ip address to be your root. I will call it "ROOT".
You also will want to generate a list of ip addresses that are your nodes. You will need to format this as a bash list.


<strong>ORDER OF EVENTS</strong>
<ol>
<li>In `docker_stop.sh`, change the remote user variable to be your name, the docker login information to be your own, and the root/ip addresses properly.</li>
```
# Docker login credentials
docker_username="yours"
docker_password="****"
registry_url="https://index.docker.io/v1/"


remote_user="urname"
test_ip_addresses=(
    here
)

remote_host="CHOSEN ROOT IP" 

```
<li>When this script finished, replace the root IP in startup.sh with your chosen root.</li>
<li>Once the root is running, replace the root IP in startup.sh with your chosen root, and the ip addresses with your same ones from the stopping script! Voila!</li>
</ol>