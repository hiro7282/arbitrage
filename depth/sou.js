const request = require('request');

var {logger, asks, bids} = require("./../config")

var getDepth = (compare) => {
  setInterval(() => {
    request.get({
      uri: "https://www.southxchange.com/api/book/LTC/BTC"
      }, function(err, req, data){
        try{
          var parsed = JSON.parse(data)
          bids.ltcbtc.sou = parsed.BuyOrders.filter(o => {
            return o.Index < 30
          }).map(o => {
            return [o.Price, o.Amount]
          })
          asks.ltcbtc.sou = parsed.SellOrders.filter(o => {
            return o.Index < 30
          }).map(o => {
            return [o.Price, o.Amount]
          })
          compare("ltcbtc")
        }catch(e){
          logger.sou.debug("depth error")
          logger.sou.debug(data)
        }
    })
    request.get({
      uri: "https://www.southxchange.com/api/book/BNB/BTC"
      }, function(err, req, data){
        try{
          var parsed = JSON.parse(data)
          bids.bnbbtc.sou = parsed.BuyOrders.filter(o => {
            return o.Index < 30
          }).map(o => {
            return [o.Price, o.Amount]
          })
          asks.bnbbtc.sou = parsed.SellOrders.filter(o => {
            return o.Index < 30
          }).map(o => {
            return [o.Price, o.Amount]
          })
          compare("bnbbtc")
        }catch(e){
          logger.sou.debug("depth error")
          logger.sou.debug(data)
        }
    })
    request.get({
      uri: "https://www.southxchange.com/api/book/XMR/BTC"
      }, function(err, req, data){
        try{
          var parsed = JSON.parse(data)
          bids.xmrbtc.sou = parsed.BuyOrders.filter(o => {
            return o.Index < 30
          }).map(o => {
            return [o.Price, o.Amount]
          })
          asks.xmrbtc.sou = parsed.SellOrders.filter(o => {
            return o.Index < 30
          }).map(o => {
            return [o.Price, o.Amount]
          })
          compare("xmrbtc")
        }catch(e){
          logger.sou.debug("depth error")
          logger.sou.debug(data)
        }
    })
    request.get({
      uri: "https://www.southxchange.com/api/book/ETH/BTC"
      }, function(err, req, data){
        try{
          var parsed = JSON.parse(data)
          bids.ethbtc.sou = parsed.BuyOrders.filter(o => {
            return o.Index < 30
          }).map(o => {
            return [o.Price, o.Amount]
          })
          asks.ethbtc.sou = parsed.SellOrders.filter(o => {
            return o.Index < 30
          }).map(o => {
            return [o.Price, o.Amount]
          })
          compare("ethbtc")
        }catch(e){
          logger.sou.debug("depth error")
          logger.sou.debug(data)
        }
    })
    request.get({
      uri: "https://www.southxchange.com/api/book/DOGE/BTC"
      }, function(err, req, data){
        try{
          var parsed = JSON.parse(data)
          bids.dogbtc.sou = parsed.BuyOrders.filter(o => {
            return o.Index < 30
          }).map(o => {
            return [o.Price, o.Amount]
          })
          asks.dogbtc.sou = parsed.SellOrders.filter(o => {
            return o.Index < 30
          }).map(o => {
            return [o.Price, o.Amount]
          })
          compare("dogbtc")
        }catch(e){
          logger.sou.debug("depth error")
          logger.sou.debug(data)
        }
    })
  }, 5000)
}
exports.getDepth = getDepth;