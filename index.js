require('date-utils');
const request = require('request');
const crypto = require('crypto');
const io = require('socket.io-client');
const { TapClient, CLIENT_EVENTS }= require("liquid-tap");
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const fs = require("fs");

var {logger, fee, SITE, KEY, th, balance, asklank, bidlank, asks, bids, PAIR, minUni,
 date, minIndex, maxIndex, makeQueryString, findPos, onOrder, balanceInterval, transferMapping, COIN, trend, PAIR_KEY} = require("./config")

var order = {};
KEY.forEach((k) => {
	order[k] = require("./order/"+k).order;
})
var getBalance = {};
KEY.forEach((k) => {
	require("./balance/"+k).getBalance();
})
var getDepth = {};
KEY.forEach((k) => {
	require("./depth/"+k).getDepth(compare);
})

var withdraw = {};
KEY.forEach((k) => {
	withdraw[k] = require("./withdraw/"+k).withdraw;
})

setTimeout(() => {
	logger.balance.debug(JSON.stringify(balance))
	for(var i=0; i<transferMapping.length; i++){
		if(balance[transferMapping[i][1]][transferMapping[i][2]] < transferMapping[i][3]){
			if(transferMapping[i][4] == "all"){
				withdraw[transferMapping[i][0]](balance[transferMapping[i][0]][transferMapping[i][2]], transferMapping[i][1], [transferMapping[i][2]]);
			}else{
				// withdraw[transferMapping[i][0]](Math.floor((balance[transferMapping[i][0]][transferMapping[i][2]]*transferMapping[i][4])*100)/100, transferMapping[i][1], [transferMapping[i][2]]);
				withdraw[transferMapping[i][0]](transferMapping[i][4], transferMapping[i][1], [transferMapping[i][2]]);
			}
		}
	}
	setInterval(() => {
		logger.balance.debug(JSON.stringify(balance))
		for(var i=0; i<transferMapping.length; i++){
			if(balance[transferMapping[i][1]][transferMapping[i][2]] < transferMapping[i][3]){
				if(transferMapping[i][4] == "all"){
					withdraw[transferMapping[i][0]](balance[transferMapping[i][0]][transferMapping[i][2]], transferMapping[i][1], [transferMapping[i][2]]);
				}else{
					// withdraw[transferMapping[i][0]](Math.floor((balance[transferMapping[i][0]][transferMapping[i][2]]*transferMapping[i][4])*100)/100, transferMapping[i][1], [transferMapping[i][2]]);
					withdraw[transferMapping[i][0]](transferMapping[i][4], transferMapping[i][1], [transferMapping[i][2]]);
				}
			}
		}
	}, balanceInterval*3)
}, balanceInterval/2)


var timer = Object.assign(...PAIR.map(k => ({[k]:0})))
var trade_interval = 1000 * 5;
var th_table = {}
KEY.forEach(k => {
    KEY.forEach(kk => {
        if(k == kk) return;
        th_table[k+kk] = {}
        PAIR.forEach(p => {
            th_table[k+kk][p] = th
        })
    })
})
setTimeout(() => {
	make_th()
}, 5000)
setInterval(() => {
	console.log(th_table)
}, 5000)


function compare(pair) {
	for(var i = 0; i < PAIR_KEY[pair].length; i++){
		if(asks[pair][PAIR_KEY[pair][i]].length == 0) {return;}
	}
	var dt = new Date();
	// if(dt.getTime() - timer[pair] < trade_interval) {return;}
	console.log(pair)
	var buycoin = "";
	var sellcoin = ""
	if(pair == "ethbtc"){
		buycoin = "eth";
		sellcoin = "btc";
	}else if(pair == "ltcbtc"){
		buycoin = "ltc";
		sellcoin = "btc";
	}else if(pair == "bnbbtc"){
		buycoin = "bnb";
		sellcoin = "btc";
	}else if(pair == "dogbtc"){
		buycoin = "dog";
		sellcoin = "btc";
	}else if(pair == "xmrbtc"){
		buycoin = "xmr";
		sellcoin = "btc";
	}

	date()
    var asklist = Array(PAIR_KEY[pair].length).fill(0);
    var bidlist = Array(PAIR_KEY[pair].length).fill(0);
    PAIR_KEY[pair].forEach((k,i) => {
        asklist[i] = (asks[pair][k][0][0]*(1+fee[k]));
        bidlist[i] = (bids[pair][k][0][0]*(1-fee[k]));
    })
    var umaaji = []
    for(var i=0; i<PAIR_KEY[pair].length; i++){
        for(var j=0; j<PAIR_KEY[pair].length; j++){
            umaaji.push({
                ask: PAIR_KEY[pair][i],
                bid: PAIR_KEY[pair][j],
                value: bidlist[j]/asklist[i]
            });
        }
    }
    umaaji.sort((a, b) => {return b.value - a.value})
    // console.log(umaaji)
	for(var i=0; i<umaaji.length; i++){
		if(umaaji[i].ask == umaaji[i].bid) break;
	    th_ = th_table[umaaji[i].ask+umaaji[i].bid][pair]
	    if(umaaji[i].value < th_){
	        return;
	    }
		var minUnit = Math.max(minUni[umaaji[i].ask][pair], minUni[umaaji[i].bid][pair])
        var minUnitBase = Math.floor(1/minUnit)
		var ask_amo = asks[pair][umaaji[i].ask][0][1];
		var bid_amo = bids[pair][umaaji[i].bid][0][1];
		var necces_amo = Math.max((Math.ceil((0.0001/asks[pair][umaaji[i].ask][0][0])*minUnitBase))/minUnitBase,
                                (Math.ceil((0.0001/bids[pair][umaaji[i].bid][0][0])*minUnitBase))/minUnitBase);
		var [buy_actual_price, buy_order_amo, buy_order_price] = makeUnit(asks[pair][umaaji[i].ask], necces_amo)
		var [sell_actual_price, sell_order_amo, sell_order_price] = makeUnit(bids[pair][umaaji[i].bid], necces_amo)
		var new_umaaji = sell_actual_price*(1-fee[umaaji[i].bid])/(buy_actual_price*(1+fee[umaaji[i].ask]))
		if(new_umaaji < th_){
	    	return;
		}
	    var amount = Math.min(buy_order_amo, sell_order_amo)
	    amount = Math.floor(amount*minUnitBase)/minUnitBase
		if(amount*asklist[SITE[umaaji[i].ask]] > balance[umaaji[i].ask][sellcoin]){
			amount = Math.floor((balance[umaaji[i].ask][sellcoin]/(asklist[SITE[umaaji[i].ask]]))*minUnitBase)/minUnitBase
            // console.log("a")
            // console.log(amount)
		}
		if(amount > balance[umaaji[i].bid][buycoin]){
			amount = Math.floor(balance[umaaji[i].bid][buycoin]*minUnitBase)/minUnitBase
            // console.log("b")
            // console.log(amount)
		}
        // console.log(necces_amo)
		if(amount < necces_amo){
			console.log("amount:"+amount+" balance shortage");
			return;
		}
		order[umaaji[i].ask]("buy", amount, buy_order_price, pair);
		order[umaaji[i].bid]("sell", amount, sell_order_price, pair);
		// console.log( amount, buy_order_price, pair)
		// console.log( amount, sell_order_price, pair)
		logger.order.debug("pair = " + pair);
		logger.order.debug("asklist: "+asklist);
		logger.order.debug("bidlist: "+bidlist);
		logger.order.debug("asks:")
		logger.order.debug(JSON.stringify(asks[pair][umaaji[i].ask].slice(0,5),null,4))
		logger.order.debug("bids:")
		logger.order.debug(JSON.stringify(bids[pair][umaaji[i].bid].slice(0,5),null,4))
		logger.order.debug("last amount: "+amount);
		logger.order.debug("umaaji = " + new_umaaji);
		logger.order.debug("th_ = " + th_);
		logger.order.debug(balance);
		balance[umaaji[i].ask][sellcoin] -= amount*buy_actual_price*(1+fee[umaaji[i].ask]);
		balance[umaaji[i].ask][buycoin] += amount*(1-fee[umaaji[i].ask]);
		balance[umaaji[i].bid][buycoin] -= amount*(1+fee[umaaji[i].bid]);
		balance[umaaji[i].bid][sellcoin] += amount*sell_actual_price*(1-fee[umaaji[i].bid]);
		timer[pair] = dt.getTime();
		make_th();
		return;
	}
}

function sleep(time) {
    const d1 = new Date();
    while (true) {
        const d2 = new Date();
        if (d2 - d1 > time) {
            return;
        }
    }
}
function makeUnit(board, unit){
    var now_amo = 0;
    var depth = 0;
    var depth_amo = 0;
    for(var i=0; i<board.length; i++){
        depth_amo = now_amo
        now_amo += Number(board[i][1])
        if(now_amo >= unit){
            depth = i;
            break;
        }
    }
    var p = 0;
    for(var i=0; i<depth; i++){
        p += board[i][0]*board[i][1];
    }
    p += board[depth][0]*(unit-depth_amo);
    p = p/unit
    var amo = depth==0 ? Number(board[0][1]) : unit
    return [p,amo,Number(board[depth][0])];
}
function make_th(){
	var sum = {}
	COIN.forEach(c => {
	    sum[c] = 0
	    KEY.forEach(k => {
	        sum[c] += balance[k][c]
	    })
	})
	var bias = {}
	COIN.forEach(c => {
	    bias[c] = {}
	    KEY.forEach(k => {
	        bias[c][k] = balance[k][c]/sum[c]
	    })
	})
	base_th = 1.00275
	max_th = 0.0015
	btc_th = 0.001
	KEY.forEach(k => {
	    KEY.forEach(kk => {
	        if(k == kk) return;
	        PAIR.forEach(p => {
	            currency = p.slice(0,3)
	            th_table[k+kk][p] = ((base_th + bias[currency][k]*max_th - bias.btc[k]*btc_th -1)*trend[k][p][0]*trend[kk][p][1])+1
	        })
	    })
	})
}