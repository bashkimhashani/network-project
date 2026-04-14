const dgram = require("dgram");
const http = require("http");
const fs = require("fs");
const path = require("path");

const UDP_PORT = 41234;
const HTTP_PORT = 8080;
const MAX_CLIENTS = 10;
const TIMEOUT_MS = 15000;
const FILES_DIR = path.join(__dirname, "files");

const clients = new Map();
const msgLog = [];

const server = dgram.createSocket("udp4");

server.on("message", (msg, rinfo) => {
    const key = `${rinfo.address}:${rinfo.port}`;
    const text = msg.toString().trim();

    if (!clients.has(key) && clients.size >= MAX_CLIENTS) {
        reply("SERVER: Lidhja u refuzua - klient maksimal arritur.", rinfo);
        return;
    }
     if (!clients.has(key)) {
        clients.set(key, {
            ip: rinfo.address,
            port: rinfo.port,
            role: "read",
            messages: [],
            lastSeen: Date.now()
        });

        console.log(`[+] Klient i ri: ${key}`);
        reply(`SERVER: U lidhe! Key: ${key}`, rinfo);
    }
    const c = clients.get(key);

c.lastSeen = Date.now();

if (text === "HELLO:admin") {
    c.role = "admin";
    reply("SERVER: Roli ADMIN u caktua.", rinfo);
    return;
}

});