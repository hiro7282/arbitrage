const request = require('request');
const crypto = require('crypto');
const {coi_AccessID} = require("../secretInfo");
var {logger, asks, bids, date, sortAlpha, balance, balanceInterval} = require("./../config")

exports.getBalance = () => {
  balanceApi();
  setInterval(() => {
    balanceApi()
  }, 1000*60)
  function balanceApi() {
    var dt = new Date();
    var unixtime = dt.getTime();
    var qs = {
      "access_id": coi_AccessID,
      "tonce": unixtime
    }
    var signature = crypto.createHash('md5').update(sortAlpha(qs), 'binary').digest('hex').toUpperCase()
    request.get({
      uri: "https://api.coinex.com/v1/balance/info",
      headers: {
          'Content-type': 'application/json',
          'authorization': signature
      },
      qs: qs
    }, function(err, req, data){
      try{
        var parsed = JSON.parse(data)
        console.log(parsed)
        var keys = Object.keys(parsed.data)
        for(var i = 0; i < keys.length; i++){
          if(keys[i] == "BTC"){
            balance.coi.btc = Number(parsed.data[keys[i]].available);
          }else if(keys[i] == "LTC"){
            balance.coi.ltc = Number(parsed.data[keys[i]].available);
          }else if(keys[i] == "BNB"){
            balance.coi.bnb = Number(parsed.data[keys[i]].available);
          }else if(keys[i] == "ETH"){
            balance.coi.eth = Number(parsed.data[keys[i]].available);
          }else if(keys[i] == "DOGE"){
            balance.coi.dog = Number(parsed.data[keys[i]].available);
          }else if(keys[i] == "XMR"){
            balance.coi.xmr = Number(parsed.data[keys[i]].available);
          }
        }
      }catch(e){
        logger.coi.debug("catch except in balance")
        logger.coi.debug(data)
      }
    })
  }
}