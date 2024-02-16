import { WebSocketServer } from "ws";
import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const websocketServer = new WebSocketServer({ port: 8083 });
/**
 * Websocket
 */
websocketServer.on("connection", (socket) => {
  // Define the client ID
  socket.USER_INFO = {
    id: crypto.randomUUID(),
    connectedAt: new Date(),
  };

  // Receiving a message
  socket.on("message", (data) => {
    // Iterate all clients
    websocketServer.clients.forEach((client) => {
      // Prevent self messaging
      if (client.USER_INFO.id === socket.USER_INFO.id) {
        return;
      }

      // Send message
      client.send(data);
    });
  });
});

/**
 * Web server
 */
const httpServer = http.createServer();

httpServer.on("request", (req, res) => {
  const { url, method } = req;

  // Serve the HTML
  if (["HEAD", "GET"].includes(method) && url === "/") {
    res.statusCode = 200;
    res.setHeader("content-type", "text/html");

    return fs.createReadStream(path.resolve("./public/index.html")).pipe(res);
  }

  // Serve the statics files
  if (["HEAD", "GET"].includes(method)) {
    const matches = url.match(/(.*?\.)(css|js)$/);

    if (matches) {
      const [file, _, ext] = matches;
      const filename = path.join("public", file);

      if (fs.existsSync(filename)) {
        const contentTypeMap = {
          css: "text/css",
          js: "application/javascript",
        };

        res.statusCode = 200;
        res.setHeader("content-type", contentTypeMap[ext] || "plain/text");

        return fs.createReadStream(filename).pipe(res);
      }

      console.log(`File ${filename} does not found`);
    }
  }

  // Serve the favicon.ico
  if (["HEAD", "GET"].includes(method) && url === "/favicon.ico") {
    const filename = path.join("public", "img", "favicon.png");
    if (fs.existsSync(filename)) {
      res.statusCode = 200;
      res.setHeader("content-type", "image/png");

      return fs.createReadStream(filename).pipe(res);
    }
  }

  // Serve 404 Error
  res.statusCode = 404;
  res.setHeader("content-type", "text/html");
  return res.end();
});

httpServer.listen(8080, "localhost", () => {
  console.log("Server started at http://localhost:8080");
});
