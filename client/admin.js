const dgram = require("dgram");
const readline = require("readline");

const SERVER_IP = "127.0.0.1";
const SERVER_PORT = 41234;
const CLIENT_PORT = 41235;

const client = dgram.createSocket("udp4");

function send(msg) {
const buf = Buffer.from(msg);
client.send(buf, 0, buf.length, SERVER_PORT, SERVER_IP);
}