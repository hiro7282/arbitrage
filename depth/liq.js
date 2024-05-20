const WebSocket = require("ws");

var {logger, asks, bids, date} = require("./../config")

var getDepth = (compare) => {
	// var ws = new WebSocket('wss://tap.liquid.com/app/LiquidTapClient');
	// ws.onopen = () => {
	// 	console.log("liq ws open")
	// 	logger.liq.debug("liquid websocket connected");
	// };
	// ws.onmessage = (message) => {
	// 	const wsEvent = JSON.parse(message.data);
	// 	// logger.liq.debug(message)
	// 	switch(wsEvent.event){
	// 	case 'pusher:connection_established':
	// 	  console.log('Liquid Connected!');
	// 	  logger.liq.debug("Liquid websocket connected");
	// 	  ws.send(JSON.stringify({"event":"pusher:subscribe","data":{"channel":"price_ladders_cash_ethbtc_sell"}}));
	// 	  ws.send(JSON.stringify({"event":"pusher:subscribe","data":{"channel":"price_ladders_cash_ethbtc_buy"}}));
	// 	  break;
	// 	case 'pusher_internal:subscription_succeeded':
	// 	  console.log('Subscribed: ' + wsEvent.channel);
	// 	  break;
	// 	case 'updated':
	// 		var parsed = JSON.parse(message.data)
	// 		if(parsed.channel == "price_ladders_cash_ethbtc_sell"){
	// 			// logger.liq.debug(parsed.data)
	// 			asks.ethbtc.liq = JSON.parse(parsed.data);
	// 			compare("ethbtc");
	// 		}else if(parsed.channel == "price_ladders_cash_ethbtc_buy"){
	// 			// logger.liq.debug(parsed.data)
	// 			bids.ethbtc.liq = JSON.parse(parsed.data);
	// 			compare("ethbtc");
	// 		}
	// 	  break;
	// 	}
	// };
	// ws.onclose = (event) => {
	// 	logger.liq.error("onclose")
	// 	logger.liq.error(event)
	// 	console.log(event)
	// 	console.log('Socket is closed. 3秒後に再接続します。', event.reason);
	// 	setTimeout(() => {
	// 	  getDepth(compare);
	// 	}, 3000);
	// };
	// ws.onerror = (event) => {
	// 	console.error(event.message);
	// 	logger.liq.error("onerror")
	// 	logger.liq.error(event)
	// 	console.log(event)
	// 	ws.close();
	// };
}
exports.getDepth = getDepth;