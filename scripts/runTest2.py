
import requests
import random
import json

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
    response = requests.post("http://" + node + ":8192/purchase", json =da, headers=headers)
    
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
    ip_addresses = ["15.185.38.199", "157.175.85.120"] #"18.230.184.226", "18.228.224.70"]
    num_ips = 1 + len(ip_addresses)

    files = ["assets/json_1k.json", "assets/json_10k.json", "assets/json_100k.json"]
    data_sizes = [1000, 10000, 100000]
    step = 100

    for ip in ip_addresses:
        url = "http://" + ip + ":8192/start"
        resp = requests.get(url, timeout=5, verify=False) #for all non-roots, broadcast so they know
        print("broadcast for " + str(ip))

    for f, r in zip(files, data_sizes):
        print(f,r, "f,r")

        lines = []
        with open(f, 'r') as file:
            lines = file.readlines()

        rep_nums = [1, num_ips // 2 , num_ips - 1] 
        filenames = []
        for num in rep_nums:
            name = "data/metricsData" + str(r) + "-numReplicas"+ str(num) + ".json"
            with open(name, 'w') as file:
                file.write("\n")
            filenames.append(name)

        for num_rep, name in zip(rep_nums, filenames):
            #print(num_rep, name, "slay ")

            url = "http://" + ip + ":8192/changeReplication"
            resp = requests.post(url, {"newReplication": num_rep}) 
            
            x = 0
            for i in range(0, r, step):
                #do we want to randomize which node
                #print(i)
                data_slice = get_lines(lines, i * step, step)
                if data_slice != []:
                    for d in data_slice:
                        node_to_use = random.choice(ip_addresses + [root_ip])
                        make_purchase_request(node_to_use, d)
                    make_mining_request(node_to_use)
                    
            get_metrics(node_to_use, name)

            node_to_use = random.choice(ip_addresses + [root_ip])
            url = "http://" + ip + ":8192/metric/reset"
            response = requests.post(url, node_to_use)
            url = "http://" + ip + ":8192/metric/reset"
            for ip in ip_addresses + [root_ip]:
                url = "http://" + ip + ":8192/resetForTest"
                response = requests.post(url, ip)


        
  

main()