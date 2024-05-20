const WebSocket = require("ws");

var {logger, asks, bids, date} = require("./../config")

var getDepth = (compare) => {
	var getEth = () => {
		var wsEth = new WebSocket('wss://stream.binance.com:9443/ws/ethbtc@depth5');
		wsEth.onopen = () => {
			console.log("bin ws open")
			logger.bin.debug("binance eth websocket connected");
		};
		wsEth.onmessage = (event) => {
			// console.log(event)
			// logger.bin.debug(event.data)
			var parsed = JSON.parse(event.data);
			asks.ethbtc.bin = parsed.asks;
			bids.ethbtc.bin = parsed.bids;
		};
		wsEth.onclose = (event) => {
			logger.bin.error("onclose")
			logger.bin.error(event)
			console.log('Socket is closed. 3秒後に再接続します。', event.reason);
			setTimeout(() => {
			  getEth();
			}, 3000);
		};
		wsEth.onerror = (event) => {
			console.error(event.message);
			logger.bin.error("onerror")
			logger.bin.error(event)
			wsEth.close();
		};
	}

	var getLtc = () => {
		var wsLtc = new WebSocket('wss://stream.binance.com:9443/ws/ltcbtc@depth5');
		wsLtc.onopen = () => {
			console.log("bin ws open")
			logger.bin.debug("binance ltc websocket connected");
		};
		wsLtc.onmessage = (event) => {
			// console.log(event)
			// logger.bin.debug(event.data)
			var parsed = JSON.parse(event.data);
			asks.ltcbtc.bin = parsed.asks;
			bids.ltcbtc.bin = parsed.bids;
		};
		wsLtc.onclose = (event) => {
			logger.bin.error("onclose")
			logger.bin.error(event)
			console.log('Socket is closed. 3秒後に再接続します。', event.reason);
			setTimeout(() => {
			  getLtc();
			}, 3000);
		};
		wsLtc.onerror = (event) => {
			console.error(event.message);
			logger.bin.error("onerror")
			logger.bin.error(event)
			wsLtc.close();
		};
	}

	var getBnb = () => {
		var wsBnb = new WebSocket('wss://stream.binance.com:9443/ws/bnbbtc@depth5');
		wsBnb.onopen = () => {
			console.log("bin ws open")
			logger.bin.debug("binance bnb websocket connected");
		};
		wsBnb.onmessage = (event) => {
			// console.log(event)
			// logger.bin.debug(event.data)
			var parsed = JSON.parse(event.data);
			asks.bnbbtc.bin = parsed.asks;
			bids.bnbbtc.bin = parsed.bids;
		};
		wsBnb.onclose = (event) => {
			logger.bin.error("onclose")
			logger.bin.error(event)
			console.log('Socket is closed. 3秒後に再接続します。', event.reason);
			setTimeout(() => {
			  getBnb();
			}, 3000);
		};
		wsBnb.onerror = (event) => {
			console.error(event.message);
			logger.bin.error("onerror")
			logger.bin.error(event)
			wsBnb.close();
		};
	}

	var getDog = () => {
		var wsDog = new WebSocket('wss://stream.binance.com:9443/ws/dogebtc@depth5');
		wsDog.onopen = () => {
			console.log("bin ws open")
			logger.bin.debug("binance dog websocket connected");
		};
		wsDog.onmessage = (event) => {
			// console.log(event)
			// logger.bin.debug(event.data)
			var parsed = JSON.parse(event.data);
			asks.dogbtc.bin = parsed.asks;
			bids.dogbtc.bin = parsed.bids;
		};
		wsDog.onclose = (event) => {
			logger.bin.error("onclose")
			logger.bin.error(event)
			console.log('Socket is closed. 3秒後に再接続します。', event.reason);
			setTimeout(() => {
			  getDog();
			}, 3000);
		};
		wsDog.onerror = (event) => {
			console.error(event.message);
			logger.bin.error("onerror")
			logger.bin.error(event)
			wsDog.close();
		};
	}

	var getXmr = () => {
		var wsXmr = new WebSocket('wss://stream.binance.com:9443/ws/xmrbtc@depth5');
		wsXmr.onopen = () => {
			console.log("bin ws open")
			logger.bin.debug("binance xmr websocket connected");
		};
		wsXmr.onmessage = (event) => {
			// console.log(event)
			// logger.bin.debug(event.data)
			var parsed = JSON.parse(event.data);
			asks.xmrbtc.bin = parsed.asks;
			bids.xmrbtc.bin = parsed.bids;
		};
		wsXmr.onclose = (event) => {
			logger.bin.error("onclose")
			logger.bin.error(event)
			console.log('Socket is closed. 3秒後に再接続します。', event.reason);
			setTimeout(() => {
			  getXmr();
			}, 3000);
		};
		wsXmr.onerror = (event) => {
			console.error(event.message);
			logger.bin.error("onerror")
			logger.bin.error(event)
			wsXmr.close();
		};
	}
	getEth()
	getLtc()
	getBnb()
	getDog()
	getXmr()
}
exports.getDepth = getDepth;