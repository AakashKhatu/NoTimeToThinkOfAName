import numpy as np
import json
import requests


response = requests.get('http://192.168.0.104:8000/getdata/-1/')
with open("new_data.json", "w") as f:
    f.write(response.text)
# j = json.load(open("new_data.json", 'r'))
j = json.loads(response.text)
x_data = np.array([(i['timestamp'], i['x']) for i in j])
y_data = np.array([(i['timestamp'], i['y']) for i in j])
z_data = np.array([(i['timestamp'], i['z']) for i in j])
