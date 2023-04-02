import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import { dirname } from "path";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile("front/index.html", { root: __dirname });
});

// Start Express http server
const webServer = createServer(app);
app.get(() => {
  console.log("connection");
});
const io = new Server(webServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  socket.position = { x: 0, y: 0, z: 0 };
  console.log(`${socket.id} connected`);
  socket.broadcast.emit("newPlayer", {
    id: socket.id,
    position: socket.position,
  });
  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} disconnected`);
    socket.broadcast.emit("removePlayer", { id: socket.id });
  });
  let players = await getAllPlayers();
  socket.emit("listOfPlayers", { players: players });
  socket.on("movement", ({ position }) => {
    socket.position = position;
    socket.broadcast.emit("movement", { id: socket.id, position: position });
  });
});

async function getAllPlayers() {
  let players = await io.fetchSockets();
  players = players.map((i) => {
    return { id: i.id, position: i.position };
  });
  return players;
}
webServer.listen(process.env.PORT || 3000, () => {
  console.log("up");
});
