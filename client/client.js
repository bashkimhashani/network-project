const dgram = require("dgram");
const readline = require("readline");

// -- Konfigurimi --
const SERVER_IP = "127.0.0.1";  // <-- ndrysho me IP te serverit kur teston ne rrjet real
const SERVER_PORT = 41234;

// IMPORTANT: Cdo klient duhet te kete PORT te ndryshëm!
// Klienti 2: 41236 | Klienti 3: 41237 | Klienti 4: 41238
const CLIENT_PORT = 41236;       // <-- ndrysho per secilin klient
const CLIENT_NAME = "Client-2";  // <-- ndrysho per secilin klient

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
  console.log(`  ${CLIENT_NAME} — READ ONLY`);
  console.log("  Mund te dergosh vetem mesazhe");
  console.log("  Shkruaj 'exit' per te dale");
  console.log("================================\n");
  send("HELLO:read");
});


// -- Input nga tastiera --
const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: `${CLIENT_NAME}> ` });
rl.prompt();

rl.on("line", (line) => {
  const input = line.trim();
  if (!input) { rl.prompt(); return; }
  if (input === "exit") { client.close(); process.exit(0); }
  send(input);
  rl.prompt();
});

// -- Mbaj lidhjen aktive me PING --
setInterval(() => send("PING"), 10000);

client.on("error", (err) => console.error(`[ERROR] ${err.message}`));