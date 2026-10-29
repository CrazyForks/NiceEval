import { createServer as createNetServer, createConnection } from "node:net";
import { createServer as createHttpServer } from "node:http";

const [targetSocket, proxySocket] = process.argv.slice(2);
let bytes = 0;
const sockets = new Set();
const relay = createNetServer(client => {
  const upstream = createConnection(targetSocket);
  for (const socket of [client, upstream]) {
    sockets.add(socket);
    socket.on("close", () => sockets.delete(socket));
    socket.on("error", () => { client.destroy(); upstream.destroy(); });
  }
  upstream.on("data", chunk => { bytes += chunk.length; });
  client.pipe(upstream).pipe(client);
});
const stats = createHttpServer((_request, response) => {
  response.end(String(bytes));
});
await new Promise(resolve => relay.listen(proxySocket, resolve));
await new Promise(resolve => stats.listen(0, "127.0.0.1", resolve));
console.log(`proxy-ready:${stats.address().port}`);
process.once("SIGTERM", () => {
  for (const socket of sockets) socket.destroy();
  stats.closeAllConnections();
  stats.close();
  relay.close();
});
