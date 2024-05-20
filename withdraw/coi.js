const request = require('request');
const crypto = require('crypto');
const {coi_AccessID} = require("../secretInfo");
var {logger, asks, bids, date, sortAlpha} = require("./../config")
const address = require("../address")

exports.withdraw = (quantity, to, coin) => {
  logger.transfer.debug("coi transfer")
  logger.transfer.debug("coin, quantity, to="+coin+", "+quantity+", "+to)
  var dt = new Date();
  var unixtime = dt.getTime();
  var currency = {eth: "ETH", btc: "BTC", ltc: "LTC", bnb:"BNB",dog:"DOGE", xmr:"XMR"}
  var body = {
    "access_id": coi_AccessID,
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
    logger.transfer.debug("coi withdrawed")
    logger.transfer.debug(data)
    console.log(data)
  })
}