require('date-utils');
const request = require('request');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

const {liq_token_id, liq_secretKey} = require("../secretInfo");
var liq_uri = "https://api.liquid.com";
var withdraw_uri = "/crypto_withdrawals";

var {logger, date} = require("./../config")
const address = require("../address")

exports.withdraw = (quantity, to, coin) => {
	var currency = {eth: "ETH", btc: "BTC", ltc: "LTC", bnb:"BNB", dog:"DOGE"}
    logger.transfer.debug("liq withdraw")
    logger.transfer.debug("coin, quantity, to="+coin+", "+quantity+", "+to)
	var dt = new Date();
	var unixtime = dt.getTime();
	var auth_payload = {
		path: withdraw_uri,
		nonce: unixtime,
		token_id: liq_token_id
	}
	var signature = jwt.sign(auth_payload, liq_secretKey, {algorithm: "HS256", expiresIn: 120});
	request.post({
	    uri: liq_uri+withdraw_uri,
	    headers: {
	        'Content-type': 'application/json',
	        'X-Quoine-Auth': signature
	    },
	    json: {
			"currency": currency[coin],
			"amount": quantity,
			"address": address[to][coin]
	    }
	}, function(err, req, data){
		date()
		console.log(data)
		logger.transfer.debug("liq withdrawed")
		logger.transfer.debug(data)
	})
}