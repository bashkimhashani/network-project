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
