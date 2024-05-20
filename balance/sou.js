require('date-utils');
const request = require('request');
const crypto = require('crypto');
const {sou_Key, sou_Secret} = require("../secretInfo");
var {logger, date, balance, onOrder, balanceInterval} = require("./../config")

exports.getBalance = () => {
	balanceApi();
	setInterval(() => {
		balanceApi()
	}, 1000*60)
	function balanceApi() {
		var dt = new Date();
		var unixtime = dt.getTime();
		var body = {
		"key": sou_Key,
		"nonce": unixtime
		}
		var signature = crypto
		.createHmac('sha512', sou_Secret)
		.update(JSON.stringify(body))
		.digest('hex')
		request.post({
		    uri: "https://www.southxchange.com/api/listBalances",
		    headers: {
		        'Content-type': 'application/json',
		        'Hash': signature
		    },
		    json: body
		}, function(err, req, data){
			try{
				data.forEach(d => {
					if(d.Currency == 'ETH'){
						balance.sou.eth = d.Available;
					}else if(d.Currency == 'BTC'){
						balance.sou.btc = d.Available;
					}else if(d.Currency == 'LTC'){
						balance.sou.ltc = d.Available;
					}else if(d.Currency == 'BNB'){
						balance.sou.bnb = d.Available;
					}else if(d.Currency == 'DOGE'){
						balance.sou.dog = d.Available;
					}else if(d.Currency == 'XMR'){
						balance.sou.xmr = d.Available;
					}
				})
			}catch(e){
				logger.sou.error(e)
				logger.sou.error(data)
			}
		})
	}
}