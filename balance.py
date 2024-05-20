import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
import json
import glob
import sys
import seaborn as sns

sns.set()
args = sys.argv
btc_yen = 900000
eth_yen = 22000
ltc_yen = 4500

with open(args[1]) as f:
  line = f.readlines()
  json_str = [l.split(' ')[2] for l in line]
  data = [json.loads(j) for j in json_str]
  btc_sum = [float(d["liq"]["btc"])+float(d["bin"]["btc"])+float(d["sou"]["btc"]) for d in data]
  eth_sum = [float(d["liq"]["eth"])+float(d["bin"]["eth"])+float(d["sou"]["eth"]) for d in data]
  ltc_sum = [float(d["liq"]["ltc"])+float(d["bin"]["ltc"])+float(d["sou"]["ltc"]) for d in data]
  yen_sum = []
  for i in range(0, len(data)):
    yen_sum.append((btc_sum[i]*90000+eth_sum[i]*22000+ltc_sum[i]*4500)/10000)
  plt.plot(range(0, len(data)), btc_sum, color='orange', label='btc')
  plt.plot(range(0, len(data)), eth_sum, color='gray', label='eth')
  plt.plot(range(0, len(data)), ltc_sum, color='blue', label='ltc')
  plt.plot(range(0, len(data)), yen_sum, color='black', label='yen')
  plt.title("balance")
  plt.legend(bbox_to_anchor=(1, 1), loc='upper right', borderaxespad=0, fontsize=18)
  plt.xlabel("x")
  plt.ylabel("y")
  plt.show();