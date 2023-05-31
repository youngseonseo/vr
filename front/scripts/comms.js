function addPlayer(id, position, model) {
  if (id === socket.id) return;
  console.log(`adding ${id} on ${JSON.stringify(position)}`);
  var scene = document.querySelector("a-scene");
  var newPlayer = document.createElement("a-box");
  newPlayer.setAttribute("id", id);
  //newPlayer.setAttribute("player");
  newPlayer.setAttribute("position", JSON.parse(JSON.stringify(position)));
  var texture = document.createElement("a-entity");

  texture.setAttribute("gltf-model", `/models/${model}/scene.gltf`);
  texture.setAttribute("rotation", "0 180 0");
  texture.setAttribute("position", "0 -0.5 0");
  texture.setAttribute("scale", "0.3 0.3 0.3");
  texture.setAttribute("animation-mixer", "clip:Rig|idle");
  texture.setAttribute("id", `${id}-texture`);
  texture.setAttribute("model", `${model}`);
  newPlayer.setAttribute("opacity", "0");
  newPlayer.setAttribute("player", "");
  newPlayer.appendChild(texture);
  scene.appendChild(newPlayer);
}
function removePlayer(id) {
  var player = document.getElementById(`${id}`);
  console.log(player);
  player.parentNode.removeChild(player);
}
function movePlayer(id, position) {
  var target = document.getElementById(id);
  target.setAttribute("position", position);
  target.components["player"].moveAnimation(id);
}
function rotatePlayer(id, rotation) {
  var target = document.getElementById(id);
  target.setAttribute("rotation", { ...rotation, x: 0 });
}

const url = window.location.host;
console.log(url);
var socket = io(url);

socket.on("newPlayer", ({ id, position, model }) => {
  if (id === socket.id) return;
  console.log("newPlayer");
  addPlayer(id, position, model);
});
socket.on("listOfPlayers", ({ players }) => {
  console.log("listOfPlayers");
  players.map((i) => {
    if (document.getElementById(i.id)) {
      movePlayer(i.id, i.position);
      rotatePlayer(i.id, i.rotation);
    } else addPlayer(i.id, i.position, i.model);
  });
  console.log(players);
});
socket.on("removePlayer", ({ id }) => {
  if (id === socket.id) return;
  console.log(`${id} has disconnected`);
  removePlayer(id);
});
socket.on("movement", ({ id, position }) => {
  if (id === socket.id) return;
  movePlayer(id, position);
});
socket.on("rotation", ({ id, rotation }) => {
  if (id === socket.id) return;
  rotatePlayer(id, rotation);
});

/*
  1. menu(UI)
  2. models 
  3. map design
  4. mini games
*/
