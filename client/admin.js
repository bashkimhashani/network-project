const dgram    = require("dgram");
const readline = require("readline");

// -- Konfigurimi --
const SERVER_IP   = "127.0.0.1";
const SERVER_PORT = 41234;
const CLIENT_PORT = 41235;

const client = dgram.createSocket("udp4");

// -- Dergo mesazh --
function send(msg) {
  const buf = Buffer.from(msg);
  client.send(buf, 0, buf.length, SERVER_PORT, SERVER_IP);
}

// -- Merr pergjigje nga serveri --
client.on("message", (msg) => {
  console.log(`\n[SERVER] ${msg.toString()}\n`);
  rl.prompt();
});


// -- Nise klientin --
client.bind(CLIENT_PORT, () => {
  console.log("================================");
  console.log("  ADMIN CLIENT");
  console.log("  /list | /read | /upload");
  console.log("  /download | /delete");
  console.log("  /search | /info | exit");
  console.log("================================\n");
  send("HELLO:admin");
});

// -- Input nga tastiera --
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "ADMIN> "
});

rl.prompt();

rl.on("line", (line) => {
    const input = line.trim();
    if (!input) { rl.prompt(); return; }
    if (input === "exit") { client.close(); process.exit(0); }
    send(input);
    rl.prompt();
});

// -- Mbaj lidhjen aktive me PING --
setInterval(() => send("PING"), 50000);

client.on("error", (err) =>
  console.error(`[ERROR] ${err.message}`)
);