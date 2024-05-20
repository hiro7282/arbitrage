require('date-utils');
const request = require('request');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");

const {liq_token_id, liq_secretKey} = require("../secretInfo");
var liq_uri = "https://api.liquid.com";
var liq_balance_path = '/accounts/balance';
var liq_order_path = "/orders/";

var {logger, date, makeQueryString} = require("./../config")

exports.order = (side, quantity, price, pair) => {
	var product_id = 0;
	if(pair == "ethbtc"){
	    product_id = 37;
	}else if(pair == "ltcbtc"){
	    product_id = 112;
	}
	// console.log(pair)
    logger.order.debug("liq order")
    logger.order.debug("side, quantity, price="+side+", "+quantity+", "+price)
	var dt = new Date();
	var unixtime = dt.getTime();
	var auth_payload = {
		path: liq_order_path,
		nonce: unixtime,
		token_id: liq_token_id
	}
	var signature = jwt.sign(auth_payload, liq_secretKey, {algorithm: "HS256", expiresIn: 120});
	request.post({
	    uri: liq_uri+liq_order_path,
	    headers: {
	        'Content-type': 'application/json',
	        'X-Quoine-Auth': signature
	    },
	    json: {
	    	order: {
				"order_type": "limit",
				"product_id": product_id,
				"side": side,
				"quantity": quantity,
				"price": price
	    	}
	    }
	}, function(err, req, data){
		date()
		console.log(data)
		logger.order.debug("liq ordered")
		logger.order.debug(data)
	})
}