require('date-utils');
const request = require('request');
const crypto = require('crypto');

const {sou_Key, sou_Secret} = require("../secretInfo");

var {logger, date, makeQueryString} = require("./../config")
const address = require("../address")

exports.withdraw = (quantity, to, coin) => {
  // var listing = "";
  // var reference = "BTC";
  // if(pair == "ETH/BTH"){
  //     listing = "ETH"
  // }else if(pair == "LTC/BTC"){
  //     listing = "LTC"
  // }
  // console.log(pair)
  var currency = {eth: "ETH", btc: "BTC", ltc: "LTC", bnb:"BNB", dog:"DOGE", xmr:"XMR"}
  logger.transfer.debug("sou transfer")
  logger.transfer.debug("coin, quantity, to="+coin+", "+quantity+", "+to)
  var dt = new Date();
  var unixtime = dt.getTime();
  var body = {
    currency: currency[coin],
    address: address[to][coin],
    amount: quantity,
    nonce: unixtime,
    key: sou_Key
  }
  var signature = crypto
  .createHmac('sha512', sou_Secret)
  .update(JSON.stringify(body))
  .digest('hex')
  request.post({
    uri: "https://www.southxchange.com/api/withdraw",
    headers: {
        'Content-type': 'application/json',
        'Hash': signature
    },
    json: body
  }, function(err, req, data){
	date()
	console.log(data)
	logger.transfer.debug("sou withdrawed")
	logger.transfer.debug(data)
  })
}