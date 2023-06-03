function addPlayer(id, position, model) {
  if (id === socket.id) return;
  console.log(`adding ${id} on ${JSON.stringify(position)}`);

  var newPlayer = document.createElement("a-box");
  newPlayer.setAttribute("id", id);
  //newPlayer.setAttribute("player");
  newPlayer.setAttribute("position", JSON.parse(JSON.stringify(position)));
  var texture = document.createElement("a-entity");

  texture.setAttribute("gltf-model", `/players/${model}/scene.gltf`);
  texture.setAttribute("rotation", "0 180 0");
  texture.setAttribute("position", "0 -0.5 0");
  texture.setAttribute("scale", "0.3 0.3 0.3");
  texture.setAttribute("animation-mixer", "clip:Rig|idle");
  texture.setAttribute("id", `${id}-texture`);
  texture.setAttribute("model", `${model}`);
  newPlayer.setAttribute("opacity", "0");
  newPlayer.setAttribute("player", "");
  newPlayer.appendChild(texture);
  var scene = document.querySelector("a-scene");
  scene.appendChild(newPlayer);
}
function removePlayer(id) {
  var player = document.getElementById(`${id}`);
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

async function connectToPeer(id, peerId) {
  connections[id] = {};
  connections[id] = await peer.connect(peerId);
  console.log(connections[id]);
  callPeer(id, peerId);
}
async function callPeer(id, peerId) {
  var call = peer.call(peerId, window.localStream);
  calls[id] = call;
  console.log(call);
  call.on("stream", (stream) => {
    var audio = document.createElement("audio");
    audio.setAttribute("id", `${call.peer}_stream`);
    audio.srcObject = stream;
    audio.autoplay = true;
    window.peerAudio.srcObject = stream;
    window.peerAudio.autoplay = true;
    window.peerStream = stream;
    window.peerAudio.play();
    //window.audios.appendChild(audio);
    //audio.play();
  });
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
  console.log(players);
  players.map((i) => {
    console.log(i);
    if (document.getElementById(i.id)) {
      movePlayer(i.id, i.position);
      rotatePlayer(i.id, i.rotation);
    } else {
      addPlayer(i.id, i.position, i.model, i.peerId);
    }
    if (i.peerId) {
      document.getElementById(i.id).setAttribute("peerid", i.peerId);
    }
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
socket.on("peerId", ({ id, peerId }) => {
  console.log(peerId);
  if (id === socket.id) return;

  var target = document.getElementById(id);
  target.setAttribute("peerid", peerId);
  connectToPeer(id, peerId);
  //callPeer(id, peerId);
});
var time = 200;
navigator.mediaDevices
  .getUserMedia({ video: false, audio: true })
  .then((stream) => {
    var mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();

    var audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", function (event) {
      audioChunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", function () {
      var audioBlob = new Blob(audioChunks);

      audioChunks = [];

      var fileReader = new FileReader();
      fileReader.readAsDataURL(audioBlob);
      fileReader.onloadend = function () {
        var base64String = fileReader.result;
        socket.emit("voice", base64String);
      };

      mediaRecorder.start();

      setTimeout(function () {
        mediaRecorder.stop();
      }, time);
    });

    setTimeout(function () {
      mediaRecorder.stop();
    }, time);
  });

socket.on("voice", function ({ id, data }) {
  if (id == socket.id) return;
  var audio = new Audio(data);
  audio.play();
});

/*
  1. menu(UI)
  2. models 
  3. map design
  4. mini games
*/
