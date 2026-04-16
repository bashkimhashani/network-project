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

client.on("message", (msg) => {
    console.log(`\n[SERVER] ${msg.toString()}\n`);
    rl.prompt();
});

client.bind(CLIENT_PORT, () => {
    console.log("================================");
    console.log(" ADMIN CLIENT");
    console.log(" /list | /read | /upload");
    console.log(" /download | /delete");
    console.log(" /search | /info | exit");
    console.log("================================\n");
    send("HELLO:admin");
});

setInterval(() => send("PING"), 10000);
    client.on("error", (err) =>
    console.error(`[ERROR] ${err.message}`)
);