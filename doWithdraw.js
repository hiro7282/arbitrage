require('date-utils');
const request = require('request');
const crypto = require('crypto');
const io = require('socket.io-client');
const { TapClient, CLIENT_EVENTS }= require("liquid-tap");
const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const fs = require("fs");

var {logger, fee, SITE, KEY, th, balance, asklank, bidlank, asks, bids,
 date, minIndex, maxIndex, makeQueryString, findPos, onOrder, balanceInterval} = require("./config")

var withdraw = {};
KEY.forEach((k) => {
	withdraw[k] = require("./withdraw/"+k).withdraw;
})

withdraw["bin"](3.57638000, "sou", "ltc")