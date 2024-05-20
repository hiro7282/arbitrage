import requests
import time
import sys
import json
import os
import time
import pickle
import schedule
import websocket
from datetime import datetime, timedelta, timezone, date
JST = timezone(timedelta(hours=+9), 'JST')

# wsurl = "wss://stream.binance.com:9443/ws/ltcbtc@depth20"
wsurl = "wss://stream.binance.com:9443/stream?streams=ltcbtc@depth20/btcusdt@depth20"
def on_message(ws, message):
    print(datetime.now(JST))
    unix = int(time.time())
    mes = json.loads(message)
    if mes["stream"] == 'ltcbtc@depth20':
        with open("ltcbtc20/"+str(unix)+".pickle", mode="wb") as f:
            pickle.dump(mes["data"], f)
    if mes["stream"] == 'btcusdt@depth20':
        with open("btcusdt20/"+str(unix)+".pickle", mode="wb") as f:
            pickle.dump(mes["data"], f)
    # with open("ltcbtc20/"+str(unix)+".txt", mode="w") as f:
    # 	f.write(message)
    # print(mes)

def on_error(ws, error):
    print("### error ###")
    print(error)
    print(datetime.now(JST))

def on_close(ws):
    print("### closed ###")
    print(datetime.now(JST))

def on_open(ws):
    print('connected streaming server')
    print(datetime.now(JST))

# websocket.enableTrace(True)
ws = websocket.WebSocketApp(wsurl,
                          on_message = on_message,
                          on_error = on_error,
                          on_close = on_close)
ws.on_open = on_open
try:
    ws.run_forever()
except KeyboardInterrupt:
    ws.close()