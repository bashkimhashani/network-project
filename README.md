# My Project
# UDP File Server

Një server UDP i ndërtuar në Node.js që mbështet disa klientë njëkohësisht me kontroll të aksesit bazuar në role. Një klient ka privilegje të plota admin ndërsa të tjerët janë vetëm-lexim. Një HTTP server paralel ofron monitorim në kohë reale.

**Protokoli:** UDP | **Gjuha:** JavaScript (Node.js) | **Min. pajisje:** 4

---

## Arkitektura

| Komponenti | Skedari | Porti |
| ---------------- | ----------- | ----- |
| UDP Server | `server.js` | 41234 |
| HTTP Monitor | `server.js` | 8080 |
| Admin Klienti | `admin.js` | 41235 |
| Klienti Lexues 2 | `client.js` | 41236 |
| Klienti Lexues 3 | `client.js` | 41237 |
| Klienti Lexues 4 | `client.js` | 41238 |

---
## Instalimi

Nuk nevojiten paketa shtesë — përdoren vetëm modulet e integruara të Node.js (`dgram`, `http`, `fs`, `path`, `readline`).

### Kërkesat

- Node.js v14 ose më i ri
- Të gjitha pajisjet duhet të jenë në të njëjtin rrjet lokal (ose e njëjta makinë për testim lokal)

### Struktura e skedarëve

```
network-project/
├── server.js
├── admin.js
├── client.js
└── files/
```

---
---

## Ekzekutimi i projektit

Hap 3 terminale të ndara dhe ekzekuto në këtë rend:

**Terminali 1 — serveri (gjithmonë i pari):**

```
node server.js
```

**Terminali 2 — klienti admin:**

```
node admin.js
```

**Terminali 3 — klienti lexues:**

```
node client.js
```

Për të verifikuar që gjithçka funksionon, hap shfletuesin në `http://localhost:8080/stats` — duhet të shohësh 2 klientë të lidhur në përgjigjen JSON.

---

## Konfigurimi i Rrjetit

### Testim lokal (një makinë)

Nuk nevojiten ndryshime. `SERVER_IP` është tashmë vendosur në `127.0.0.1`.

### Rrjet real (disa makina)

Personi që ekzekuton `server.js` duhet të gjejë IP adresën e tij lokale:

```
ipconfig # Windows
ifconfig # macOS / Linux
```

Kërko `IPv4 Address` (p.sh. `192.168.1.105`).

Çdo anëtar i ekipit ndryshon këtë rresht në `admin.js` dhe `client.js`:

```js
const SERVER_IP = "127.0.0.1"; // ndrysho këtë
const SERVER_IP = "192.168.1.105"; // me IP-në e personit që ekzekuton serverin
```

### Disa klientë lexues

Çdo klient duhet të ketë port dhe emër unik në `client.js`:

```js
const CLIENT_PORT = 41236; // Klienti 2: 41236 | Klienti 3: 41237 | Klienti 4: 41238
const CLIENT_NAME = "Client-2"; // ndrysho për secilin klient
```

---

## Rolet dhe Privilegjet

| Roli | Vendoset me | Privilegjet |
| ------- | ------------- | --------------------------------------------- |
| `admin` | `HELLO:admin` | Qasje e plotë — të gjitha komandat + mesazhet |
| `read` | `HELLO:read` | Vetëm dërgim mesazhesh të thjeshta |

Rolet caktohen automatikisht gjatë startimit. Nëse nuk funksionon (problem me kohën), shkruaje manualisht:

```
HELLO:admin
HELLO:read
```

---

## Komandat e Adminit

| Komanda | Përshkrimi | Shembull |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------- |
| `/list` | Liston të gjitha skedarët në direktorinë `files/` të serverit | `/list` |
| `/read <filename>` | Shfaq përmbajtjen e një skedari | `/read shenime.txt` |
| `/upload <filename>:<content>` | Krijon ose mbishkruan një skedar në server | `/upload test.txt:Pershendetje` |
| `/download <filename>` | Shkarkon një skedar nga serveri | `/download shenime.txt` |
| `/delete <filename>` | Fshin një skedar nga serveri | `/delete i_vjeter.txt` |
| `/search <fjalekyçe>` | Kërkon emrat e skedarëve që përmbajnë fjalën kyçe | `/search raport` |
| `/info <filename>` | Shfaq madhësinë, datën e krijimit dhe modifikimit | `/info shenime.txt` |

---

## Klienti Lexues

Klientët lexues mund të dërgojnë vetëm mesazhe të thjeshta. Komandat që fillojnë me `/` refuzohen.

| Hyrja | Rezultati |
| --------- | ----------------------------------------------------------------- |
| Çdo tekst | Serveri e regjistron dhe përgjigjet: `Mesazhi u mor` |
| `PING` | Serveri përgjigjet `PONG` (dërgohet automatikisht çdo 10 sekonda) |
| `exit` | Mbyll klientin |

---

## HTTP Monitori

Një HTTP server i thjeshtë ekzekutohet paralelisht në portin 8080.

| URL | Formati | Përshkrimi |
| ----------------------------- | ------- | --------------------------------------------------------------- |
| `http://localhost:8080` | HTML | Faqe bazë me numrin e klientëve dhe mesazheve |
| `http://localhost:8080/stats` | JSON | Statistika të plota: uptime, klientët, rolet, mesazhet e fundit |

Shembull i përgjigjes `/stats`:

```json
{
"udp_port": 41234,
"uptime_sec": 42,
"total_clients": 2,
"total_messages": 7,
"clients": [...],
"recent_messages": [...]
}
```

## Karakteristikat e Serverit

- Mbështet deri në **10 klientë njëkohësisht**. Lidhjet e reja refuzohen kur arrihet kufiri.
- Klientët joaktivë për më shumë se **15 sekonda** shkëputen automatikisht.
- Rilidhjea është automatike — një klient që rilidhet regjistrohet si sesion i ri.
- Të gjitha mesazhet ruhen me vulën kohore, çelësin e klientit, rolin dhe përmbajtjen.

