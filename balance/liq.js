require('date-utils');
const request = require('request');
const jwt = require("jsonwebtoken");
const {liq_token_id, liq_secretKey} = require("../secretInfo");
var {logger, date, balance, onOrder, balanceInterval} = require("./../config")

var liq_uri = "https://api.liquid.com";
var liq_balance_path = '/accounts/balance';

exports.getBalance = () => {
	balanceApi();
	setInterval(() => {
		if(onOrder){
			return;
		}
		balanceApi()
	}, balanceInterval)
	function balanceApi() {
		var dt = new Date();
		var unixtime = dt.getTime();
		var auth_payload = {
			path: liq_balance_path,
			nonce: unixtime,
			token_id: liq_token_id
		}
		var signature = jwt.sign(auth_payload, liq_secretKey, {algorithm: "HS256", expiresIn: 120});
		request.get({
		    uri: liq_uri+liq_balance_path,
		    headers: {
		        'Content-type': 'application/json',
		        'X-Quoine-Auth': signature
		    },
		    json: true
		}, function(err, req, data){
			console.log(data)
			console.log(balance)
			var data_ = data;
			try{
				data_.forEach((b) => {
					if(b.currency == "ETH"){
						balance.liq.eth = b.balance;
					}else if(b.currency == "BTC"){
						balance.liq.btc = b.balance;
					}else if(b.currency == "LTC"){
						balance.liq.ltc = b.balance;
					}else if(b.currency == "BNB"){
						balance.liq.bnb = b.balance;
					}else if(b.currency == "DOGE"){
						balance.liq.dog = b.balance;
					}
				})
			}catch(e){
				logger.liq.error(e)
				logger.liq.error(data)
			}
		})
	}
}