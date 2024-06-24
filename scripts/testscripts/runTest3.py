
import requests
import random
import json
import time

headers = {'Content-Type': 'application/json'}

def get_lines(lines, start, step):

    if start < 0 or start >= len(lines):
        return []

    # Calculate end index for slicing
    end = min(start + step, len(lines))

    # Extract lines in chunks
    chunk = lines[start:end]

    return chunk

def make_purchase_request(node, data):
    
    #for d in data_slice:
    da = json.loads(data)
    response = requests.post("http://" + node + ":8192/purchase", json = da, headers=headers)
    
    
    
    #print("Sent the purchase requests for chunk. ")

def make_mining_request(node):
    response = requests.post("http://" + node + ":8192/mineNewBlock")
    if response.status_code == 200:
        print("200 response for mine to node " + node + ".")
    else:
        print("Diff response code for mining.")
    
def get_metrics(node, name):
    response = requests.get("http://" + node + ":8192/metric/getMetrics")
    if response.status_code == 200:
        with open(name, 'a') as file:
            # Use json.dumps with response.json() to convert the response to JSON string
            json_data = json.dumps(response.json())
            file.write(json_data + '\n')
            print(json_data)
    else:
        print(response.status_code)

 


def main():
    root_ip = "13.48.48.239"
    #ip_addresses = ["15.185.38.199", "157.175.85.120"] #"18.230.184.226", "18.228.224.70"]
    #ip_addresses 
    # ip_addresses = [
    # '3.89.231.167', '54.204.131.69', '34.228.197.147',
    #  '3.135.204.68', '54.241.136.136',
    # '15.185.38.199', '157.175.85.120', '34.245.77.164'  #107.23.192.217 bad
    # ]

    ip_addresses = [
    '51.17.24.10', '51.17.168.219',
    '3.28.44.128', '3.29.126.32', '15.161.56.73',
    '15.160.247.27', '52.47.75.71', '13.39.18.95',
    '51.20.98.34', '13.48.48.239', '15.185.38.199',
    '157.175.85.120', '18.230.184.226', '18.228.224.70',
    '13.246.232.5'
    ]

    for ip in ip_addresses + [root_ip]:
                url = "http://" + ip + ":8192/resetForTest"
                response = requests.post(url, ip)

    

   
    num_ips = 1 + len(ip_addresses)

    files = ["assets/json_1k.json", "assets/json_10k.json", "assets/json_100k.json"]
    data_sizes = [1000, 10000, 100000]
    step = 25

    for ip in ip_addresses:
        url = "http://" + ip + ":8192/start"
        try:
            resp = requests.get(url) #) timeout=5, verify=False) #for all non-roots, broadcast so they know
            print("broadcast for " + str(ip))
            #time.sleep(2)
        except ConnectionRefusedError:
            print("oop")
            #delete


    lines = []
    with open("assets/json_1k.json", 'r') as file:
            lines = file.readlines()

    rep_nums = [1, 4, 8, num_ips // 2 , num_ips - 1] 
    name = "data/metricsData" + str(1000) + "numIps"+ str(num_ips) + "2.json"
    with open(name, 'a') as file:
                file.write("\n")

    for num_rep in rep_nums:
            for ip in ip_addresses + [root_ip]:
                url = "http://" + ip + ":8192/changeReplication"
                resp = requests.post(url, {"newReplication": num_rep}) 
            
            #name = "data/metricsData" + str(1000) + "-numReplicas"+ str() + ".json"
            with open(name, 'a') as file:
                        file.write(str(num_rep) + "\t")
            
            c = 0
            for i in range(0, 1000, step):
                
                data_slice = get_lines(lines, i * step, step)
                if data_slice != []:
                    node_to_use = random.choice(ip_addresses + [root_ip])
                    for d in data_slice:
                        node_to_use = random.choice(ip_addresses + [root_ip])
                        make_purchase_request(node_to_use, d)
                        c+= 1
                        #if c%10 == 0:
                            #print(c)
                    #make_mining_request(node_to_use)
            
            get_metrics(node_to_use, name)

            node_to_use = random.choice(ip_addresses + [root_ip])
            url = "http://" + ip + ":8192/metric/reset"
            response = requests.post(url, node_to_use)
            for ip in ip_addresses + [root_ip]:
                url = "http://" + ip + ":8192/resetForTest"
                response = requests.post(url, ip)



main()