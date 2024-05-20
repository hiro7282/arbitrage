var fee = {bit: 0.0012, liq: 0.001, pol: 0.0009, bin: 0.001, huo: 0.002, sou:0.003, coi:0.002};
var th = 1.005;
var pair = "ETH/BTC";
var balanceInterval = 1000 * 60 * 20;

const KEY = ["bin", "sou", "coi"];
var PAIR = ["ethbtc", "ltcbtc", "bnbbtc", "dogbtc", "xmrbtc"]
var COIN = ["btc", "eth", "ltc", "bnb", "dog", "xmr"]
var PAIR_KEY = {
	"ethbtc": ["bin", "sou"],
	"ltcbtc": ["bin", "sou", "coi"],
	"bnbbtc": ["bin", "sou", "coi"],
	"dogbtc": ["bin", "sou"],
	"xmrbtc": ["bin", "sou", "coi"]
}
var SITE = {};
KEY.forEach((k, i) => {
	SITE[k] = i;
})
var minUni = {
	bin:{"ethbtc":0.0001, "ltcbtc":0.001, "bnbbtc":0.001, "dogbtc": 1, "xmrbtc": 0.001},
	sou:{"ethbtc":0.00000001, "ltcbtc":0.00000001, "bnbbtc":0.00000001, "dogbtc": 0.00000001, "xmrbtc": 0.00000001},
	coi:{"ethbtc":0.00000001, "ltcbtc":0.00000001, "bnbbtc":0.00000001, "dogbtc": 0.000001, "xmrbtc": 0.00000001}
}
var trend = {
	bin:{"ethbtc":[0.5, 1.2], "ltcbtc":[1, 1], "bnbbtc":[1.1, 0.9], "dogbtc":[0.1,5] , "xmrbtc":[0.5, 1.2] },
	sou:{"ethbtc":[1,1], "ltcbtc":[1,1], "bnbbtc":[1,1], "dogbtc":[1,1] , "xmrbtc":[1,1] },
	coi:{"ethbtc":[1,1], "ltcbtc":[1,1], "bnbbtc":[1,1], "dogbtc":[1,1], "xmrbtc":[1,1] }
}

const transferMapping = [
		// ["bin", "sou", "ltc", 0.01, 22],
		// ["bin", "sou", "btc", 0.00015, "all"],
		// ["sou", "bin", "ltc", 0.01, "all"],
		// ["bin", "sou", "bnb", 0.01, "all"],
		// ["bin", "sou", "xmr", 0.01, "all"],
		// ["sou", "bin", "xmr", 0.01, "all"],
		// ["sou", "bin", "dog", 27, "all"],
		// ["sou", "bin", "bnb", 0.01, "all"]
	];

const log4js = require('log4js');
var logconf = {
  "appenders": {
    "debug": { "type": "file", "filename": "debug.log" },
    "uma": {"type": "file", "filename": "log/uma.log", "pattern": "yyyyMMdd-hh", "alwaysIncludePattern": true, "backups": 30},
    "order": {"type": "file", "filename": "log/order.log", "pattern": "yyyyMMdd-hh", "alwaysIncludePattern": true, "backups": 30},
    "transfer": {"type": "file", "filename": "log/transfer.log", "pattern": "yyyyMMdd-hh", "alwaysIncludePattern": true, "backups": 30},
    "error": {"type": "file", "filename": "log/error.log", "pattern": "yyyyMMdd-hh", "alwaysIncludePattern": true, "backups": 30},
	"balance": {
	"type": "file",
	 "filename": "log/balance.log",
	 "pattern": "yyyyMM",
	 "maxLogSize": 500000000,
	 "layout": {
	    "type": 'pattern',
	    "pattern": '%d{yyyy-MM-dd-hh:mm:ss.SSS} %p %m',
	 },
	 "alwaysIncludePattern": true,
	 "backups": 72,
	 "compress": false
	}
  },
  "categories": {
   "uma": { "appenders": ["uma"], "level": "debug" },
   "order": { "appenders": ["order"], "level": "debug" },
   "transfer": { "appenders": ["transfer"], "level": "debug" },
   "error": { "appenders": ["error"], "level": "debug" },
   "balance": { "appenders": ["balance"], "level": "debug" },
   "default": {"appenders": ["debug"], "level": "debug"}
  }
}
KEY.forEach(key => {
	logconf.appenders[key] = {
		"type": "file",
		"filename": "log/"+key+".log",
		"pattern": "yyyyMMdd-hh",
		"alwaysIncludePattern": true,
		"backups": 30
	}
	logconf.categories[key] = { "appenders": [key], "level": "debug" };
})
log4js.configure(logconf);
var logger = {};
KEY.forEach((key) => {
	logger[key] = log4js.getLogger(key);
})
logger.uma = log4js.getLogger('uma');
logger.order = log4js.getLogger('order');
logger.transfer = log4js.getLogger('transfer');
logger.balance = log4js.getLogger('balance');
logger.error = log4js.getLogger('error');

var balance = {};
KEY.forEach((key) => {
	balance[key] = {}
	COIN.forEach(c => {
		balance[key][c] = 0
	})
})

exports.date = () => {
    var dt = new Date();
    var formatted = dt.toFormat("YYYY/MM/DD HH24:MI:SS");
    console.log(formatted);
}
exports.makeQueryString = (q) => {
  return q ? `?${Object.keys(q)
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(q[k])}`)
        .join('&')}`
    : ''
}
exports.maxIndex = (a) => {
	let index = 0
	let value = -Infinity
	for (let i = 0, l = a.length; i < l; i++) {
		if (value < a[i]) {
			value = a[i]
			index = i
		}
	}
	return index
}
exports.minIndex = (a) => {
	let index = 0
	let value = Infinity
	for (let i = 0, l = a.length; i < l; i++) {
		if (value > a[i]) {
			value = a[i]
			index = i
		}
	}
	return index
}
exports.findPos = (arr, factor) => {
  var rtn = 0;
  arr.forEach((a, i) => {
    if(factor > a){
      rtn = i+1
    }
  })
  return rtn
}
var sortAlpha = (obj) => {
	const SecretKey = "6982198B88810B1C5757CD6BAEE26BC44723785017425C58"
  var rtn = ""
  var keys = Object.keys(obj).sort()
  for(var i=0; i < keys.length; i++){
    rtn += keys[i]+"="+obj[keys[i]]+"&"
  }
  rtn += "secret_key="+SecretKey
  return rtn
}
var asks = {};
var bids = {};
PAIR.forEach(p => {
	asks[p] = {};
	bids[p] = {};
	KEY.forEach(k => {
		if(PAIR_KEY[p].includes(k)){
			asks[p][k] = [];
			bids[p][k] = [];
		}
	})
})

var flag = {};
KEY.forEach((key) => {
	flag[key] = false;
})
var onOrder = false;
exports.logger = logger;
exports.balance = balance;
exports.fee = fee;
exports.KEY = KEY;
exports.SITE = SITE;
exports.th = th;
exports.asklank = Array(KEY.length).fill(0);
exports.bidlank = Array(KEY.length).fill(0);
exports.asks = asks;
exports.bids = bids;
exports.flag = flag;
exports.onOrder = onOrder;
exports.balanceInterval = balanceInterval;
exports.transferMapping = transferMapping;
exports.PAIR = PAIR;
exports.minUni = minUni;
exports.COIN = COIN;
exports.trend = trend;
exports.sortAlpha = sortAlpha;
exports.PAIR_KEY = PAIR_KEY;
