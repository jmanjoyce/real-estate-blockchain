### run network tests.
### simulate different request to mine and do stuff to different nodes.
### gather data from network information
import requests
import random

"""
set up a bunch of nodes... 
metric endpoint 
start sending information to the blockchain
-- pending transactions
--send transactions to the other nodes
--mining 
look @ clientRoutes purchase, mineNewBlock
python axios 
common.ts 
"""


def get_lines(lines, start, step):
    return lines[start:start + step]

def make_purchase_request(node, data_slice):
    for d in data_slice:
        response = requests.post(node + "/purchase", json = d)
        #check success maybe
    
    print("Sent the purchase requests for chunk. ")

def make_mining_request(node):
    response = requests.get(node + "/mineNewBlock")
    if response.status_code == 200:
        print("200 response for mine to node " + node + ".")
    else:
        print("Diff response code for mining.")


ips = []
num_ips = len(ips)

files = ["scripts/assets/json_1k.json", "scripts/assets/json_10k.json", "scripts/assets/json_100k.json"]
data_sizes = [1000, 10000, 100000]
step = 100

for f, r in zip(files, data_sizes):
    with open(f, 'r') as file:
        lines = file.readlines()
    #for every X line objects, purchase, then mine
    for i in range(r, step):
        #do we want to randomize which node
        data_slice = get_lines(lines, i * step, step)
        node_to_use = random.choice(ips)
        make_purchase_request(node_to_use, data_slice)
        make_mining_request(node_to_use)

