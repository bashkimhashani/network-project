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
    from: key, 
    role: c.role, 
    msg: text 
  });

  console.log(`[MSG] ${key} (${c.role}): ${text}`);

  // Vendos rolin
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

  // Komandat
  if (c.role === "admin") {
    handleCommand(text, rinfo);
  } else {
    if (text.startsWith("/")) reply("SERVER: Nuk ke privilegje per komanda.", rinfo);
    else reply(`SERVER: Mesazhi u mor - "${text}"`, rinfo);
  }  
});

function handleCommand(text,rinfo) {
  const parts = text.trim().split(" ");
  const cmd = parts[0];
  const arg = parts.slice(1).join(" ");

  if (cmd ==="/list") {
    const files = fs.readdirSync(FILES_DIR);
    reply (files.length ? "FILES:\n" + files.join("\n") : "FILES: (bosh)", rinfo);

  } else if (cmd ==="/read") {
    try {
      const content = fs.readFileSync(path.join(FILES_DIR,arg),"utf8");
      reply('CONTENT:\n $ {arg}',rinfo);
    } catch { reply('ERROR:"${arg}" nuk u gjet.',rinfo); }
  
  } else if (cmd === "/delete") {
      try {
        fs.unlinkSync(path.join(FILES_DIR, arg));
        reply(`SERVER: "${arg}" u fshi.`, rinfo);
      } catch {
        reply(`ERROR: Nuk u fshi "${arg}".`, rinfo);
      }

  } else if (cmd === "/search") { 
    const results = fs.readdirSync(FILES_DIR).filter(f => f.includes(arg));
      reply( results.length ? "MATCHES:\n" + results.join("\n") : "SEARCH: Asnje rezultat.", rinfo );

  } else if (cmd === "/info") { 
    try { 
      const s = fs.statSync(path.join(FILES_DIR, arg)); 
      reply(
      `INFO: ${arg}\n Madhesia: ${s.size} bytes\n` + 
      ` Krijuar: ${s.birthtime.toLocaleString()}\n` + 
      ` Modifikuar: ${s.mtime.toLocaleString()}`, rinfo );
    } catch { reply(`ERROR: "${arg}" nuk u gjet.`, rinfo); }

  } else if (cmd === "/upload") {
    const i = arg.indexOf(":");

    if (i === -1) { 
      reply("Sintaksa: /upload :", rinfo);
      return;
    }
    
    fs.writeFileSync(
      path.join(FILES_DIR, arg.substring(0, i)),
      arg.substring(i + 1)
    );

    reply(`SERVER: "${arg.substring(0, i)}" u ngarkua.`, rinfo);
 
  } else if (cmd === "/download") { 
    try { 
      const content = fs.readFileSync( 
        path.join(FILES_DIR, arg), "utf8" 
      );
      
      reply(`DOWNLOAD:${arg}\n${content}`, rinfo);
    } catch { 
        reply(`ERROR: "${arg}" nuk u gjet.`, rinfo); 
      }

    } else { 
      reply(`SERVER: Komanda e panjohur "${cmd}"`, rinfo); 
    }
  }
  
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


server.on("error", (err) => { console.error(`[ERROR] ${err.message}`); server.close(); });
server.on("listening", () => {
  console.log("================================");
  console.log(` UDP Server: port ${UDP_PORT}`);
  console.log(` HTTP Monitor: port ${HTTP_PORT}`);
  console.log("================================");
});
server.bind(UDP_PORT);

http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/stats") {

        const data = {
      udp_port: UDP_PORT,
      uptime_sec: Math.floor(process.uptime()),
      total_clients: clients.size,
      total_messages: msgLog.length,
      clients: [...clients.entries()].map(([key, c]) => ({
        key,
        role: c.role,
        messages: c.messages.length,
        last_messages: c.messages.slice(-3)
      })),
      recent_messages: msgLog.slice(-10)
    };

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data, null, 2));


      } else {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<html>
              <body>
                <h2>UDP Monitor</h2>
                <p><a href="/stats">Shiko /stats</a></p>
                <p>Kliente: <b>${clients.size}</b> | Mesazhe: <b>${msgLog.length}</b></p>
              </body>
            </html>`);
  }
}).listen(HTTP_PORT, () =>
  console.log(`[HTTP] http://localhost:${HTTP_PORT}/stats`)
);

  