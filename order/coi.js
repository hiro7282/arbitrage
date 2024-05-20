const request = require('request');
const crypto = require('crypto');
const {coi_AccessID} = require("../secretInfo");
var {logger, asks, bids, date, sortAlpha, address} = require("./../config")

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
    "access_id": coi_AccessID,
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
    logger.order.debug("coi order")
    logger.order.debug("side, quantity, price="+side+", "+quantity+", "+price)
    console.log(data)
    logger.order.debug("coi ordered")
    logger.order.debug(data)
  })
}
exports.order = order;