import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
const url = "http://localhost:3000";
const socket = io(url);
socket.onAny(() => {
  console.log("hi");
});
