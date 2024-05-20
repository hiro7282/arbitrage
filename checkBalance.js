require('date-utils');
const request = require('request');
const crypto = require('crypto');
const io = require('socket.io-client');
const { TapClient, CLIENT_EVENTS }= require("liquid-tap");
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const fs = require("fs");

var {fee, SITE, KEY, th, balance, asklank, bidlank, asks, bids,
 date, minIndex, maxIndex, makeQueryString, findPos, flag} = require("./config")

var order = {};
KEY.forEach((k) => {
	order[k] = require("./order/"+k).order;
})

var liq_token_id    = "1367080";
var liq_secretKey = "jPqI0Rwbd0SexxgEFML4j+1xLUGp4qtbzWuUxcQWaUvXK8HaWV/Nw+Nb4de2VLPNs0P0cSg7SISSw5H+3W3aLw==";
var liq_uri = "https://api.liquid.com";
var liq_balance_path = '/accounts/balance';
var liq_order_path = "/orders/";
var liq_transfer_path = "/crypto_withdrawals";

var bin_API_Key = "clYnOeXCBxZ9S1EsXSDT4rM8WFgQOtHjiZTQ2pzlhlzI6yAWFKCdUIIslSq2z38V";
var bin_API_Secret = "U1P3de3OXFQ7uF2mOZVLiHg1rDP0cfQt6rr5zm8apX0tG3JcLzCM8glS04xaVJY2";
var bin_listenKey = "";
var bin_uri = "https://api.binance.com";
var bin_order_path = "/api/v3/order";
var bin_transfer_path = "/wapi/v3/withdraw.html";

var sou_Key = "aAlSbmiaogt1siWre5OfT1TJgRWgI5";
var sou_Secret = "ohicX3WHteARRU3GvkPMFJwwp5BjZCaQMM2dahl4P90DgAygIp";

var traded = false;
var timer = 0;
var interval = 10;
var trade_interval = 1000 * 2;


var balance_ = {liq:{}, bin:{}, sou:{}}

function liqBalance() {
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
    	var data_ = data;
    	try{
			data_.forEach((b) => {
				if(b.currency == "ETH"){
					balance.liq.eth = b.balance;
					balance_.liq.eth = b.balance;
				}else if(b.currency == "BTC"){
					balance.liq.btc = b.balance;
					balance_.liq.btc = b.balance;
				}else if(b.currency == "LTC"){
					balance.liq.ltc = b.balance;
					balance_.liq.ltc = b.balance;
				}
			})
    	}catch(e){
    		console.log(e)
    	}
    	flag.liq = true;
    })
}

function binBalance() {
	var dt = new Date();
	var unixtime = dt.getTime();
	var body = {
		"timestamp": unixtime
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
	        'X-MBX-APIKEY': bin_API_Key,
	        'signature': signature
	    },
	    qs: body
	}, function(err, req, data){
		var parsed = [];
		parsed = JSON.parse(data)
		// console.log(parsed)
		parsed.forEach(a => {
			if(a.coin == "BTC"){
				balance.bin.btc = Number(a.free)+Number(a.locked);
				balance_.bin.btc = a.locked
			}else if(a.coin == "ETH"){
				balance.bin.eth = Number(a.free)+Number(a.locked);
				balance_.bin.eth = a.locked
			}else if(a.coin == "LTC"){
				balance.bin.ltc = Number(a.free)+Number(a.locked);
				balance_.bin.ltc = a.locked
			}else if(a.coin == "BNB"){
				balance.bin.bnb = Number(a.free)+Number(a.locked);
				balance_.bin.bnb = a.locked
			}else if(a.coin == "DOGE"){
				balance.bin.dog = Number(a.free)+Number(a.locked);
				balance_.bin.dog = a.locked
			}else if(a.coin == "XMR"){
				balance.bin.xmr = Number(a.free)+Number(a.locked);
				balance_.bin.xmr = a.locked
			}
		})
		flag.bin = true;
	})
}

var souBalance = () => {
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
    	console.log(data)
      data.forEach(d => {
      	if(d.Currency == 'ETH'){
      		balance.sou.eth = d.Deposited;
      		balance_.sou.eth = d.Deposited-d.Available;
      	}
      	if(d.Currency == 'BTC'){
      		balance.sou.btc = d.Deposited;
      		balance_.sou.btc = d.Deposited-d.Available;
      	}
		if(d.Currency == 'LTC'){
      		balance.sou.ltc = d.Deposited;
      		balance_.sou.ltc = d.Deposited-d.Available;
      	}
		if(d.Currency == 'BNB'){
      		balance.sou.bnb = d.Deposited;
      		balance_.sou.bnb = d.Deposited-d.Available;
      	}
		if(d.Currency == 'DOGE'){
      		balance.sou.dog = d.Deposited;
      		balance_.sou.dog = d.Deposited-d.Available;
      	}
      	if(d.Currency == 'XMR'){
      		balance.sou.xmr = d.Deposited;
      		balance_.sou.xmr = d.Deposited-d.Available;
      	}
      })
      flag.sou = true;
    })
}

// liqBalance();
binBalance();
souBalance();

// var btc_jpy = 900000;
// var eth_jpy = 24000;
// var ltc_jpy = 4500;
// var btc_jpy = 6600000;
// var eth_jpy = 250000;
// var ltc_jpy = 30000;
// var bnb_jpy = 37700;
// var dog_jpy = 35;
// var xmr_jpy = 31000;
var btc_jpy = 7000000;
var eth_jpy = 520000;
var ltc_jpy = 28000;
var bnb_jpy = 71400;
var dog_jpy = 30;
var xmr_jpy = 30000;

var intervalObj = setInterval(() => {
	var f = true;
	["bin", "sou"].forEach((k) => {
		if(!flag[k]) {
			f = false;
		}
	})
	if(f){
		date();
		console.log(balance)
		clearInterval(intervalObj);
		var sum = {eth: 0, btc: 0, ltc: 0, bnb:0, dog:0, xmr:0};
		var sum_ = {eth: 0, btc: 0, ltc: 0, bnb:0, dog:0, xmr:0};
		["bin", "sou"].forEach(k => {
			sum.eth += Number(balance[k].eth);
			sum.btc += Number(balance[k].btc);
			sum.ltc += Number(balance[k].ltc);
			sum.bnb += Number(balance[k].bnb);
			sum.dog += Number(balance[k].dog);
			sum.xmr += Number(balance[k].xmr);
			sum_.eth += Number(balance_[k].eth);
			sum_.btc += Number(balance_[k].btc);
			sum_.ltc += Number(balance_[k].ltc);
			sum_.bnb += Number(balance_[k].bnb);
			sum_.dog += Number(balance_[k].dog);
			sum_.xmr += Number(balance_[k].xmr);
		})
		var yen = btc_jpy*sum.btc + eth_jpy*sum.eth + ltc_jpy*sum.ltc + bnb_jpy*sum.bnb + dog_jpy*sum.dog + xmr_jpy*sum.xmr;
		var btc = sum.btc+0.0352*sum.eth+0.0035*sum.ltc+0.009*sum.bnb+0.00000864*sum.dog+0.0076*sum.xmr;
		console.log("sum = ")
		console.log(sum)
		console.log("yen = " + yen)
		console.log("btc = " + btc)
		console.log("locked = ")
		console.log(balance_)
	}
}, 1000)