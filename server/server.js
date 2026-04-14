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
c.messages.push(text);

msgLog.push({
  time: new Date().toISOString(),
  from: key, role: c.role, msg: text
});
console.log(`[MSG] ${key} (${c.role}): ${text}`);

if (text === "HELLO:admin") {
    c.role = "admin";
    reply("SERVER: Roli ADMIN u caktua.", rinfo);
    return;
}

if (text === "HELLO:read") {
    c.role = "read";
    reply("SERVER: Roli READ u caktua.", rinfo);
    return;
}

if (text === "PING") {
    reply("PONG", rinfo);
    return;
}


if (c.role === "admin") {
    handleCommand(text, rinfo);
} else {
    if (text.startsWith("/")) {
        reply("SERVER: Nuk ke privilegje per komanda.", rinfo);
    } else {
        reply(`SERVER: Mesazhi u mor - "${text}"`, rinfo);
    }
}

});


setInterval(() => {
  const now = Date.now();
  for (const [key, c] of clients.entries()) {
    if (now - c.lastSeen > TIMEOUT_MS) {
      console.log(`[TIMEOUT] ${key} u shkepput.`);
      clients.delete(key);
    }
  }
}, 5000);

function reply(message, rinfo) {
  const buf = Buffer.from(message);
  server.send(buf, 0, buf.length, rinfo.port, rinfo.address);
}

server.on("error", (err) => {
  console.error(`[ERROR] ${err.message}`);
  server.close();
});

server.on("listening", () => {
  console.log(`UDP Server: port ${UDP_PORT}`);
});
server.bind(UDP_PORT);