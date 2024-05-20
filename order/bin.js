require('date-utils');
const request = require('request');
const crypto = require('crypto');

const {bin_API_KEY, bin_API_Secret} = require("../secretInfo");
var bin_uri = "https://api.binance.com";
var bin_order_path = "/api/v3/order";

var {logger, date, makeQueryString} = require("./../config")

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
    // console.log(pair)
	var dt = new Date();
	var unixtime = dt.getTime();
	var body = {
		"symbol": symbol,
		"side": side,
		"type": "LIMIT",
		"quantity": quantity,
		"price": price,
		"timeInForce": "GTC",
		"timestamp": unixtime
	}
	var signature = crypto
      .createHmac('sha256', bin_API_Secret)
      .update(makeQueryString({ ...body}).substr(1))
      .digest('hex')
	body.signature = signature;
    request.post({
        uri: bin_uri+bin_order_path,
        headers: {
            'Content-type': 'application/json',
            'X-MBX-APIKEY': bin_API_Key,
            'signature': signature
        },
        qs: body
    }, function(err, req, data){
        logger.order.debug("bin order")
        logger.order.debug("side, quantity, price="+side+", "+quantity+", "+price)
    	date()
    	console.log(data)
    	logger.order.debug("bin ordered")
    	logger.order.debug(data)
        data_ = JSON.parse(data)
        if(data_.code){
            // order(side, quantity, price, pair)
            logger.error.debug("bin pair = "+ pair)
            logger.error.debug("bin side, quantity, price="+side+", "+quantity+", "+price)
            logger.error.debug(data)
        }
    })
}

exports.order = order;