const WebSocket = require("ws");
const request = require('request');
const crypto = require('crypto');

var {logger, asks, bids, date, sortAlpha, balance, balanceInterval} = require("./config")

const AccessID = "4F2E7EF26F8F41839EBDC9C642C76515"

var order = (side, quantity, price, pair) => {
  var symbol = "";
  if(pair == "ethbtc"){
      symbol = "ETHBTC";
  }else if(pair == "ltcbtc"){
      symbol = "LTCBTC";
  }else if(pair == "bnbbtc"){
      symbol = "BNBBTC";
  }else if(pair == "dogbtc"){
      symbol = "DOGEBTC";
  }else if(pair == "xmrbtc"){
      symbol = "XMRBTC";
  }
  var dt = new Date();
  var unixtime = dt.getTime();
  var body = {
    "access_id": AccessID,
    "amount": quantity,
    "market": symbol,
    "price": price,
    "tonce": unixtime,
    "type": side,
  }
  var signature = crypto.createHash('md5').update(sortAlpha(body), 'binary').digest('hex').toUpperCase()
  request.post({
    uri: "https://api.coinex.com/v1/order/limit",
    headers: {
        'Content-type': 'application/json',
        'authorization': signature
    },
    json: body
  }, function(err, req, data){
    console.log(data)
  })
}
// order("buy", 1, 0.003, "ltcbtc")

var getBalance = () => {
  var dt = new Date();
  var unixtime = dt.getTime();
  var qs = {
    "access_id": AccessID,
    "tonce": unixtime
  }
  var signature = crypto.createHash('md5').update(sortAlpha(qs), 'binary').digest('hex').toUpperCase()
  request.get({
    uri: "https://api.coinex.com/v1/balance/info",
    headers: {
        'Content-type': 'application/json',
        'authorization': signature
    },
    qs: qs
  }, function(err, req, data){
    var parsed = JSON.parse(data)
    console.log(parsed)
    var keys = Object.keys(parsed.data)
    for(var i = 0; i < keys.length; i++){
      if(keys[i] == "BTC"){
        balance.coi.btc = parsed.data[keys[i]].available;
      }else if(keys[i] == "LTC"){
        balance.coi.ltc = parsed.data[keys[i]].available;
      }else if(keys[i] == "BNB"){
        balance.coi.bnb = parsed.data[keys[i]].available;
      }else if(keys[i] == "ETH"){
        balance.coi.eth = parsed.data[keys[i]].available;
      }else if(keys[i] == "DOGE"){
        balance.coi.dog = parsed.data[keys[i]].available;
      }else if(keys[i] == "XMR"){
        balance.coi.xmr = parsed.data[keys[i]].available;
      }
    }
    console.log(balance)
  })
}
getBalance()

var withdraw = (quantity, to, coin) => {
  var dt = new Date();
  var unixtime = dt.getTime();
  var currency = {eth: "ETH", btc: "BTC", ltc: "LTC", bnb:"BNB",dog:"DOGE", xmr:"XMR"}
  var body = {
    "access_id": AccessID,
    "coin_type": currency[coin],
    "coin_address": address[to][coin],
    "actual_amount": String(quantity),
    "transfer_method": "onchain",
    "tonce": unixtime
  }
  var signature = crypto.createHash('md5').update(sortAlpha(body), 'binary').digest('hex').toUpperCase()
  request.post({
    uri: "https://api.coinex.com/v1/balance/coin/withdraw",
    headers: {
        'Content-type': 'application/json',
        'authorization': signature
    },
    json: body
  }, function(err, req, data){
    console.log(data)
  })
}
// withdraw(1, "bin", "btc")

var httpDepth = () => {
  console.time('get');
  body = {
    "market": "LTCBTC",
    "merge": "0.00000001",
    "limit": 10
  }
  request.get({
      uri: "https://api.coinex.com/v1/market/depth",
      headers: {
          'Content-type': 'application/json',
      },
      qs: body
  }, function(err, req, data){
      console.timeEnd('get');
      console.time('console');
      console.log(data)
      console.timeEnd('console');
      data_ = JSON.parse(data)
  })
}

require('date-utils');
var getDepth = () => {
  var ws = new WebSocket('wss://socket.coinex.com/');
  var id = 15
  var start = new Date()
  var end = new Date() - start
  timelist = []
  ws.onopen = () => {
    console.log("ws open")
    // ws.send(JSON.stringify({
    //   "method":"depth.subscribe_multi",
    //   "params":[
    //     ["LTCBTC", 10, "0.00000001"],
    //     ["BNBBTC", 10, "0.00000001"]
    //   ],
    //   "id": id
    // }));
    setInterval(() => {
      ws.send(JSON.stringify({
        "method":"depth.query",
        "params":
          ["LTCBTC", 10, "0.00000001"]
        ,
        "id": id
      }));
      ws.send(JSON.stringify({
        "method":"depth.query",
        "params":
          ["BNBBTC", 10, "0.00000001"]
        ,
        "id": 16
      }));
    }, 1000)

  };
  ws.onmessage = (event) => {
    date()
    // console.log(event)
    console.log(event.data)
    // var parsed = JSON.parse(event.data);
    // if(parsed.id == id) return;
    // if(parsed.params[0] == true){
    //   if(parsed.params[2] == "LTCBTC"){
    //     asks.ltcbtc.coi = parsed.params[1].asks;
    //     bids.ltcbtc.coi = parsed.params[1].bids;
    //     console.log(asks.ltcbtc)
    //   }else if(parsed.params[2] == "BNBBTC"){
    //     asks.bnbbtc.coi = parsed.params[1].asks;
    //     bids.bnbbtc.coi = parsed.params[1].bids;
    //     console.log(asks.bnbbtc)
    //   }
    //   end = new Date() - start
    //   timelist.push(end)
    //   start = new Date()
    //   console.log(timelist)
    // }
  };
  ws.onclose = (event) => {
    logger.coi.debug("onclose")
    logger.coi.debug(event.reason)
    setTimeout(() => {
      getDepth();
    }, 3000);
  };
  ws.onerror = (event) => {
    console.error(event.message);
    ws.close();
  };
}
// getDepth()