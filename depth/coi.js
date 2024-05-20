const WebSocket = require("ws");
const request = require('request');

var {logger, asks, bids, date} = require("./../config")

var getDepth = (compare) => {
  var ws = new WebSocket('wss://socket.coinex.com/');
  ws.onopen = () => {
    console.log("coi ws open")
    logger.coi.debug("websocket connected");
    setInterval(() => {
      ws.send(JSON.stringify({
        "method": "depth.query",
        "params": ["LTCBTC", 10, "0.00000001"],
        "id": 11
      }));
      ws.send(JSON.stringify({
        "method":"depth.query",
        "params": ["BNBBTC", 10, "0.00000001"],
        "id": 10
      }));
      ws.send(JSON.stringify({
        "method":"depth.query",
        "params": ["XMRBTC", 10, "0.00000001"],
        "id": 9
      }));
    }, 1000)
  };
  ws.onmessage = (event) => {
    // console.log(event)
    // console.log(event.data)
    try{
      var parsed = JSON.parse(event.data);
      if(parsed.id == 11){
        asks.ltcbtc.coi = parsed.result.asks;
        bids.ltcbtc.coi = parsed.result.bids;
      }else if(parsed.id == 10){
        asks.bnbbtc.coi = parsed.result.asks;
        bids.bnbbtc.coi = parsed.result.bids;
      }else if(parsed.id == 9){
        asks.xmrbtc.coi = parsed.result.asks;
        bids.xmrbtc.coi = parsed.result.bids;
      }
    }catch(e){
      logger.coi.debug("catch except in depth")
      logger.coi.debug(event.data)
    }
  };
  ws.onclose = (event) => {
    logger.coi.debug("onclose")
    logger.coi.debug(event.reason)
    setTimeout(() => {
      getDepth(compare);
    }, 3000);
  };
  ws.onerror = (event) => {
    console.error(event.message);
    logger.coi.error("onerror")
    logger.coi.error(event)
    ws.close();
  };
}
exports.getDepth = getDepth;