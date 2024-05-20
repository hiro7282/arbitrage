const WebSocket = require("ws");
const fs = require("fs");
require('date-utils');

var asks=[];
var bids=[];

var getDepth = () => {
	var ws = new WebSocket('wss://tap.liquid.com/app/LiquidTapClient');
	ws.onopen = () => {
		console.log("liq ws open")
	};
	ws.onmessage = (message) => {
		const wsEvent = JSON.parse(message.data);
		// logger.liq.debug(message)
		switch(wsEvent.event){
		case 'pusher:connection_established':
		  console.log('Liquid Connected!');
		  ws.send(JSON.stringify({"event":"pusher:subscribe","data":{"channel":"price_ladders_cash_btcjpy_sell"}}));
		  ws.send(JSON.stringify({"event":"pusher:subscribe","data":{"channel":"price_ladders_cash_btcjpy_buy"}}));
		  break;
		case 'pusher_internal:subscription_succeeded':
		  console.log('Subscribed: ' + wsEvent.channel);
		  break;
		case 'updated':
			var parsed = JSON.parse(message.data)
			if(parsed.channel == "price_ladders_cash_btcjpy_sell"){
				// console.log("update sell")
				asks = JSON.parse(parsed.data);
			}else if(parsed.channel == "price_ladders_cash_btcjpy_buy"){
				// console.log("update buy")
				bids = JSON.parse(parsed.data);
			}
			// console.log(parsed)
		  break;
		}
	};
	ws.onclose = (event) => {
		// console.log(event)
		var dt = new Date();
		var unixtime = dt.getTime();
		console.log(unixtime)
		console.log('Socket is closed. 1秒後に再接続します。', event.reason);
		setTimeout(() => {
		  getDepth();
		}, 1000);
	};
	ws.onerror = (event) => {
		console.error(event.message);
		console.log(event)
		ws.close();
	};

	setInterval(() => {
		var dt = new Date();
		var unixtime = dt.getTime();
		fs.writeFile("btcjpy_liq/"+unixtime+".txt", asks.join("\n")+"\nbid\n"+bids.join("\n"), (err) => {
		  if (err){
		  	console.log("ファイル書き込みエラー")
		  	console.log(err)
		  	throw err
		  }
		});
	}, 2000)
}

getDepth()