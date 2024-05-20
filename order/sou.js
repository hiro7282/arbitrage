require('date-utils');
const request = require('request');
const crypto = require('crypto');

const {sou_Key, sou_Secret} = require("../secretInfo");

var {logger, date, makeQueryString} = require("./../config")

var order = (side, quantity, price, pair) => {
  var listing = "";
  var reference = "BTC";
  if(pair == "ethbtc"){
      listing = "ETH"
  }else if(pair == "ltcbtc"){
      listing = "LTC"
  }else if(pair == "bnbbtc"){
      listing = "BNB"
  }else if(pair == "dogbtc"){
      listing = "DOGE"
  }else if(pair == "xmrbtc"){
      listing = "XMR"
  }
  // console.log(pair)
  var dt = new Date();
  var unixtime = dt.getTime();
  var body = {
    listingCurrency: listing,
    referenceCurrency: reference,
    type: side,
    amount: quantity,
    limitPrice: price,
    nonce: unixtime,
    key: sou_Key
  }
  var signature = crypto
  .createHmac('sha512', sou_Secret)
  .update(JSON.stringify(body))
  .digest('hex')
  request.post({
    uri: "https://www.southxchange.com/api/placeOrder",
    headers: {
        'Content-type': 'application/json',
        'Hash': signature
    },
    json: body
  }, function(err, req, data){
  	date()
  	console.log(data)
    logger.order.debug("sou order")
    logger.order.debug("side, quantity, price="+side+", "+quantity+", "+price)
  	logger.order.debug("sou ordered")
  	logger.order.debug(data)
    if(isNaN(Number(data))){
      // order(side,quantity,price,pair)
      logger.error.debug("sou pair = "+ pair)
      logger.error.debug("sou side, quantity, price="+side+", "+quantity+", "+price)
      logger.error.debug("nonce = "+ unixtime)
      logger.error.debug(data)
    }
  })
}

exports.order = order;