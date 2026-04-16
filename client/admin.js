const dgram = require("dgram");
const readline = require("readline");

const SERVER_IP = "127.0.0.1";
const SERVER_PORT = 41234;
const CLIENT_PORT = 41235;

const client = dgram.createSocket("udp4");