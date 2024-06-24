from asyncio import as_completed
import json
import requests
from concurrent.futures import ThreadPoolExecutor


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


# Function to send POST requests
def send_requests(ip, data):
    headers = {'Content-Type': 'application/json'}
   
    for idx, payload in enumerate(data, 1):
        # Alternate between endpoints every n requests
        if idx % n == 0:
            url = f"http://{ip}:8192/mineNewBlock"  # Replace 'endpoint2' with the second endpoint
        else:
            url = f"http://{ip}:8192/purchase"  # Replace 'endpoint1' with the first endpoint

        try:
            response = requests.post(url, headers=headers, json=payload)
            print(f"Response from {url}: {response.status_code}")
        except Exception as e:
            print(f"Error sending request to {url}: {e}")

# Read JSON file
def read_json_file(filename):
    with open(filename, 'r') as file:
        data = json.load(file)
    return data

if __name__ == "__main__":
    json_filename = 'assets/json_1k.json'  # Replace with your JSON file name
    ip_addresses = ["15.185.38.199", "157.175.85.120"] # Replace with your IP addresses
    n = 100  # Change n to specify after how many requests to switch endpoint

    for ip in ip_addresses:
        url = "http://" + ip + ":8192/start"
        resp = requests.get(url, timeout=5, verify=False) #for all non-roots, broadcast so they know
        print("broadcast for " + str(ip))
    ip_addresses.append("13.48.48.239")

    # Read JSON data
    json_data = read_json_file(json_filename)

    # Divide data evenly among IP addresses
    divided_data = [json_data[i::len(ip_addresses)] for i in range(len(ip_addresses))]

    # Send requests concurrently
    tasks = []
    with ThreadPoolExecutor(max_workers=len(ip_addresses)) as executor:
        for i in range(len(ip_addresses)):
            tasks.append(executor.submit(send_requests, ip_addresses[i], divided_data[i]))

    # Wait for all tasks to complete
    for future in as_completed(tasks):
        pass  # Do nothing, just wait for all tasks to complete

    print("All requests sent and completed.")
