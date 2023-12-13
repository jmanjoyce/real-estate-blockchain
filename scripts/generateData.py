
import json
import random 
## Instructions for abby. Create JSON Object for the data. with 
## [{"name": name, "address": address, "price": price},....]
## maybe create 1000 addys, 10000, and 100000 (for now)

#for the lines in the already existing data <3 
# create json objects that match structure 
def get_random_object(lines):
    line = random.choice(lines)
    try:
        data = json.loads(line)
        return data
        #print(data)
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")

def create_addr_string(obj):
    new_addr = ""
    new_addr += (obj["properties"]["number"] + " " \
         + obj["properties"]["street"] + ", ")
    if obj["properties"]["city"] != "":
        new_addr += (obj["properties"]["city"] + " " \
            + obj["properties"]["region"] + " " +  obj["properties"]["postcode"])
    else:
        new_addr += (obj["properties"]["district"] + " " \
            + obj["properties"]["region"] + ", " +  obj["properties"]["postcode"])
  
    return new_addr

def generate_test_sets():

    json_1k= set()
    json_10k = set()
    json_100k = set()

    #choose a random address
    ranges = [1000, 10000, 100000]
    range_to_set = [tuple([1000, json_1k]), tuple([10000, json_10k]), tuple([100000, json_100k])]

    with open("scripts/assets/source.geojson", 'r') as file:
        lines = file.readlines()

    for r, s in range_to_set:
        while len(s) < r:
            #choose a random line from the source.geojson
            obj = get_random_object(lines)
            add_str = create_addr_string(obj)
            #reformat
            new_obj = {"name": "Abby", "address": add_str, "price": random.randint(70000, 150000)}
            s.add(json.dumps(new_obj))
        
        #print(s)
    
    return [json_1k, json_10k, json_100k]

sets = generate_test_sets()
print(sets[0])