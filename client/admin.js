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