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
  
  } else if (cmd === "/delete") {
      try {
        fs.unlinkSync(path.join(FILES_DIR, arg));
        reply(`SERVER: "${arg}" u fshi.`, rinfo);
      } catch {
        reply(`ERROR: Nuk u fshi "${arg}".`, rinfo);
      }
      
    }else if (cmd === "/search") { 
    const results = fs.readdirSync(FILES_DIR)
     .filter(f => f.includes(arg));
      reply( results.length 
        ? "MATCHES:\n" + results.join("\n")
        : "SEARCH: Asnje rezultat.",
         rinfo
     );
     
       } else if (cmd === "/info") { 
        try { 
        const s = fs.statSync(path.join(FILES_DIR, arg)); 
        reply(
        `INFO: ${arg}\n Madhesia: ${s.size} bytes\n` + 
        ` Krijuar: ${s.birthtime.toLocaleString()}\n` + 
        ` Modifikuar: ${s.mtime.toLocaleString()}`, 
             rinfo
             );
             } catch { reply(`ERROR: "${arg}" nuk u gjet.`, rinfo); 
            }


     } else if (cmd === "/download") { 
         try { 
            const content = fs.readFileSync( 
             path.join(FILES_DIR, arg), "utf8" 
             );
            reply(`DOWNLOAD:${arg}\n${content}`, rinfo);
         } catch { reply(`ERROR: "${arg}" nuk u gjet.`, rinfo); }
          } else { 
              reply(`SERVER: Komanda e panjohur "${cmd}"`, rinfo); 
             }

  }
  
