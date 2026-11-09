import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';

const PORT = 3001;

const server = http.createServer((req, res) => {
  fs.readFile("./public/index.html", (err, data) => {
    if (err){
      console.error("Server error:", err)
      res.writeHead(500, "Internal Server Error");
      res.end("Server closed");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
})

const wss = new WebSocketServer({ server });

wss.on("connection", (socket, req) => {
  const username = new URL(req.url, "http://localhost").searchParams.get("username");
  socket.on("open", () => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN){
        client.send(JSON.stringify({
          type: "system",
          text: `${username} joined`
        }))
      }
    })
  })
  socket.on("message", (data) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: "chat",
          ...JSON.parse(data.toString())
        }));
      }
    });
  })
  socket.on("close", () => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN){
        client.send(JSON.stringify({
          type: "system",
          text: `${username} left`
        }))
      }
    })
  })

  socket.on("error", (err) => {
    console.error("Socket error:", err);
  })
})

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
})