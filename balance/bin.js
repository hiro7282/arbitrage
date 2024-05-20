require('date-utils');
const request = require('request');
const crypto = require('crypto');
const WebSocket = require("ws");
const {bin_API_KEY, bin_API_Secret} = require("../secretInfo");
var {logger, balance, date, makeQueryString, onOrder} = require("./../config")

var bin_listenKey = "";
var bin_uri = "https://api.binance.com";

exports.getBalance = () => {
	init_binBalance()
	/* Get Listen Key BINANCE User Stream */
	request.post({
	    uri: bin_uri+"/api/v3/userDataStream",
	    headers: {
	        'Content-type': 'application/json',
	        'X-MBX-APIKEY': API_KEY
	    },
	    json: true
	}, function(err, req, data) {
		bin_listenKey = data.listenKey;
		binBalance()
		console.log(data)
	})
	/* Update Listen Key */
	setInterval(() => {
		request.put({
		    uri: "https://api.binance.com"+"/api/v3/userDataStream",
		    headers: {
		        'Content-type': 'application/json',
		        'X-MBX-APIKEY': API_KEY
		    },
		    qs: {
		    	listenKey: bin_listenKey
		    }
		}, function(err, req, data) {
			date()
			console.log("update binance listen key")
			console.log(data)
		})
	}, 1000 * 60 * 20)
	function binBalance() {
		const binWS = new WebSocket('wss://stream.binance.com:9443/ws/'+bin_listenKey);
		binWS.on('open', function open() {
		  console.log("bin balance ws open")
		  date()
		});
		binWS.on('message', function incoming(data) {
			var parsed = JSON.parse(data);
			if(parsed.e == "outboundAccountPosition"){
				parsed.B.forEach(b => {
					if(b.a == "ETH"){
						balance.bin.eth = Number(b.f);
					}else if(b.a == "BTC"){
	    				balance.bin.btc = Number(b.f);
	    			}else if(b.a == "LTC"){
	    				balance.bin.ltc = Number(b.f);
	    			}else if(b.a == "BNB"){
	    				balance.bin.bnb = Number(b.f);
	    			}else if(b.a == "DOGE"){
	    				balance.bin.dog = Number(b.f);
	    			}else if(b.a == "XMR"){
	    				balance.bin.xmr = Number(b.f);
	    			}
				})
			}
			date()
		});
		binWS.onclose = (event) => {
			logger.bin.error("balance ws onclose")
			logger.bin.error(event)
			console.log('Balance Socket is closed. 3秒後に再接続します。', event.reason);
			setTimeout(() => {
			  binBalance();
			}, 3000);
		};
		binWS.onerror = (event) => {
			console.error(event.message);
			logger.bin.error("balance ws onerror")
			logger.bin.error(event)
			binWS.close();
		};
	}
	function init_binBalance() {
		var dt = new Date();
		var unixtime = dt.getTime();
		var body = {
			"timestamp": unixtime-1000
		}
		var qs = makeQueryString(body);
		var signature = crypto
		  .createHmac('sha256', bin_API_Secret)
		  .update(makeQueryString({ ...body}).substr(1))
		  .digest('hex')
		body.signature = signature;
		request.get({
		    uri: bin_uri+"/sapi/v1/capital/config/getall",
		    headers: {
		        'Content-type': 'application/json',
		        'X-MBX-APIKEY': API_KEY,
		        'signature': signature
		    },
		    qs: body
		}, function(err, req, data){
			var parsed = [];
			parsed = JSON.parse(data)
			parsed.forEach(a => {
				if(a.coin == "BTC"){
					balance.bin.btc = Number(a.free);
				}else if(a.coin == "ETH"){
					balance.bin.eth = Number(a.free);
				}else if(a.coin == "LTC"){
					balance.bin.ltc = Number(a.free);
				}else if(a.coin == "BNB"){
					balance.bin.bnb = Number(a.free);
				}else if(a.coin == "DOGE"){
					balance.bin.dog = Number(a.free);
				}else if(a.coin == "XMR"){
					balance.bin.xmr = Number(a.free);
				}
			})
		})
	}
}