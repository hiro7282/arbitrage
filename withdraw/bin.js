require('date-utils');
const request = require('request');
const crypto = require('crypto');

const {bin_API_KEY, bin_API_Secret} = require("../secretInfo");
var bin_uri = "https://api.binance.com";
var bin_order_path = "/api/v3/order";
var bin_withdraw_path = "/sapi/v1/capital/withdraw/apply"

var {logger, date, makeQueryString} = require("./../config")
const address = require("../address")

exports.withdraw = (quantity, to, coin) => {
    logger.transfer.debug("bin transfer")
    logger.transfer.debug("coin, quantity, to="+coin+", "+quantity+", "+to)
	var dt = new Date();
	var unixtime = dt.getTime();
    var currency = {eth: "ETH", btc: "BTC", ltc: "LTC", bnb:"BNB",dog:"DOGE", xmr:"XMR"}
	var body = {
		"coin": currency[coin],
		"address": address[to][coin],
		"amount": quantity,
		"timestamp": unixtime
	}
    if(coin == "bnb"){
        body.network = "BSC"
    }
	var signature = crypto
      .createHmac('sha256', bin_API_Secret)
      .update(makeQueryString({ ...body}).substr(1))
      .digest('hex')
	body.signature = signature;
    request.post({
        uri: bin_uri+bin_withdraw_path,
        headers: {
            'Content-type': 'application/json',
            'X-MBX-APIKEY': bin_API_Key,
            'signature': signature
        },
        qs: body
    }, function(err, req, data){
    	date()
    	console.log(data)
    	logger.transfer.debug("bin withdrawed")
    	logger.transfer.debug(data)
    })
}