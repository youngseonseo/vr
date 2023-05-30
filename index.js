import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { dirname } from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import { readdirSync } from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const models = readdirSync("./front/models"); //get all the model folders
const app = express();
app.use(cors());
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile("front/index.html", { root: __dirname });
});

app.get("/:file", function (req, res) {
  res.sendFile(`front/${req.params.file}`, { root: __dirname });
});

app.get("/scripts/:file", function (req, res) {
  res.sendFile(`front/scripts/${req.params.file}`, {
    root: __dirname,
  });
});
app.get("/models/:model/:file", function (req, res) {
  res.sendFile(`front/models/${req.params.model}/${req.params.file}`, {
    root: __dirname,
  });
});
app.get("/models/:model/textures/:file", function (req, res) {
  res.sendFile(`front/models/${req.params.model}/textures/${req.params.file}`, {
    root: __dirname,
  });
});

// Start Express http server
const webServer = createServer(app);
const io = new Server(webServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const sockets = {};
io.on("connection", async (socket) => {
  socket.join(socket.handshake.headers.referer);
  sockets[socket.id] = socket.handshake.headers.referer;
  socket.position = { x: 0, y: 0, z: 0 };
  socket.rotation = { x: 0, y: 0, z: 0 };
  var modelIndex = Math.floor(Math.random() * 10) % models.length;
  socket.model = models[modelIndex];
  console.log(`${socket.id} connected`);
  io.sockets.in(sockets[socket.id]).emit("newPlayer", {
    id: socket.id,
    position: socket.position,
    rotation: socket.rotation,
    model: socket.model,
  });
  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} disconnected`);
    delete sockets[socket.id];
    socket.leave(sockets[socket.id]);
    io.sockets.in(sockets[socket.id]).emit("removePlayer", { id: socket.id });
  });
  let players = await getAllPlayers(sockets[socket.id]);
  socket.emit("listOfPlayers", { players: players });
  socket.on("movement", ({ position }) => {
    socket.position = position;
    io.sockets
      .in(sockets[socket.id])
      .emit("movement", { id: socket.id, position: position });
  });
  socket.on("rotation", ({ rotation }) => {
    socket.rotation = rotation;
    io.sockets.in(sockets[socket.id]).emit("rotation", {
      id: socket.id,
      rotation: socket.rotation,
    });
  });
});

async function getAllPlayers(room) {
  let players = await io.fetchSockets();
  players = players
    .map((i) => {
      return { id: i.id, position: i.position, model: i.model };
    })
    .filter((i) => sockets[i.id] == room);
  return players;
}
webServer.listen(process.env.PORT || 3000, () => {
  console.log("up");
});
