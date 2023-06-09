var muted = false;

function addPlayer(id, position, model, customization) {
  console.log(id);
  console.log(position);
  console.log(model);
  console.log(customization);
  if (id === socket.id) return;
  console.log(`adding ${id} on ${JSON.stringify(position)}`);

  var newPlayer = document.createElement("a-entity");gi
  newPlayer.setAttribute("id", id);
  //newPlayer.setAttribute("player");
  newPlayer.setAttribute("position", JSON.parse(JSON.stringify(position)));
  var texture = document.createElement("a-entity");

  texture.setAttribute("gltf-model", `/players/${model}/scene.gltf`);
  texture.setAttribute("rotation", "0 180 0");
  texture.setAttribute("position", "0 0 0");
  texture.setAttribute("scale", "1 1 1");
  texture.setAttribute("animation-mixer", "clip:Rig|idle");
  texture.setAttribute("id", `${id}-texture`);
  texture.setAttribute("model", `${model}`);
  newPlayer.setAttribute("opacity", "0");
  newPlayer.setAttribute("player", "");
  newPlayer.setAttribute("scale", "0.3 0.3 0.3");
  newPlayer.setAttribute("rotation", "0 0 0");
  newPlayer.appendChild(texture);

  if (customization.mask != null) {
    var mask = document.createElement("a-entity");
    mask.setAttribute("gltf-model", customization.mask.model);
    mask.setAttribute("position", customization.mask.position);
    mask.setAttribute("rotation", customization.mask.rotation);
    mask.setAttribute("scale", customization.mask.scale);
    newPlayer.appendChild(mask);

    mask_new = mask.getAttribute("rotation");
    mask_new.y *= -1;
    mask.setAttribute("rotation", mask_new);

    mask_pos = mask.getAttribute("position");
    mask_pos.z *= -1;
    mask.setAttribute("position", mask_pos);
    //fix
    }

  if (customization.backpack != null) {
    var backpack = document.createElement("a-entity");
    backpack.setAttribute("gltf-model", customization.backpack.model);
    backpack.setAttribute("position", customization.backpack.position);
    backpack.setAttribute("rotation", customization.backpack.rotation);
    backpack.setAttribute("scale", customization.backpack.scale);
    newPlayer.appendChild(backpack);

    backpack_new = backpack.getAttribute("rotation");
    backpack_new.y *= -1;
    backpack.setAttribute("rotation", backpack_new);
    //backpack_pos = backpack.getAttribute("position");
  }

  var nickname_table = document.createElement("a-gui-label");
  nickname_table.setAttribute("value", customization.nickname);
  nickname_table.setAttribute("position", "0 3.5 0");
  nickname_table.setAttribute("align", "center");
  nickname_table.setAttribute("width", "3");
  nickname_table.setAttribute("height", "0.75");
  nickname_table.setAttribute("font-size", "0.25");
  nickname_table.setAttribute("font-color", "white");
  nickname_table.setAttribute("background-color", "#072B73");
  nickname_table.setAttribute("look-at", "[me]");
  newPlayer.appendChild(nickname_table);

  window.setTimeout(() => {
    if (customization.player_color != null) {
      playerColor(texture, customization.player_color);
    } else {
      playerColor(texture, "blue");
    }
  }, 6000);
  newPlayer.setAttribute("position", "0 -0.5 0");

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
if (!localStorage.getItem("nickname")) window.location.href = "/intro.html";
var myCustomization = {
  nickname: localStorage.getItem("nickname"),
  player_color: localStorage.getItem("player_color"),
  mask: JSON.parse(localStorage.getItem("mask")),
  backpack: JSON.parse(localStorage.getItem("backpack")),
};
console.log(myCustomization.mask);
socket.emit("customization", myCustomization);
socket.on("newPlayer", ({ id, position, model, customization }) => {
  if (id === socket.id) return;
  console.log("newPlayer");
  console.log(customization);
  addPlayer(id, position, model, customization);
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
      addPlayer(i.id, i.position, i.model, i.customization);
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
      if (!muted) {
        mediaRecorder.start();

        setTimeout(function () {
          mediaRecorder.stop();
        }, time);
      }
    });

    setTimeout(function () {
      mediaRecorder.stop();
    }, time);
  });

socket.on("voice", function ({ id, data }) {
  if (id == socket.id) return;
  var audio = new Audio(data);
  var volume = calcVolume(id);
  audio.volume = volume;
  audio.play();
});
socket.on("timeStamp", function ({ time }) {
  let video = document.querySelector("#video");
  console.log(`${time} ${video.duration}`);
  video.currentTime = `${time / video.duration}`;
  console.log(`${time % video.duration}`);
});

function calcVolume(id) {
  var target = document?.getElementById(id)?.getAttribute("position");
  var me = document.querySelector("[me]").getAttribute("position");
  if (!target) return 0;
  var distance = Math.sqrt(
    Math.pow(target.x - me.x, 2) + Math.pow(target.z - me.z, 2)
  );
  return clamp((10 - distance) / 10, 0, 1);
}

function clamp(a, min, max) {
  return a < min ? 0 : a > max ? max : a;
}
/*
  1. menu(UI)
  2. models 
  3. map design
  4. mini games
*/

function playerColor(texture, color) {
  console.log(color);

  switch (color) {
    case "red":
      colorr = "rgb(224, 0, 0)";
      break;
    case "green":
      colorr = "rgb(15, 224, 0)";
      break;
    case "black":
      colorr = "rgb(0, 0, 0)";
      break;
    case "blue":
      colorr = "rgb(0, 32, 148)";
      break;
    case "yellow":
      colorr = "rgb(182, 224, 27)";
      break;
    case "purple":
      colorr = "rgb(225, 27, 224)";
      break;
    case "orange":
      colorr = "rgb(224, 145, 27)";
      break;
    case "brown":
      colorr = "rgb(61, 39, 6)";
      break;
    case "white":
      colorr = "rgb(255, 255, 255)";
      break;
    case "pink":
      colorr = "rgb(217, 22, 207)";
      break;
    case "lime":
      colorr = "rgb(72, 232, 60)";
      break;
    case "grey":
      colorr = "rgb(59, 59, 59)";
      break;
  }
  console.log(colorr);

    let tree3D = texture.getObject3D('mesh'); // Get THREEjs object from GLTF model
    console.log(tree3D);
    console.log(texture);
    if (!tree3D){return;} 
    console.log("poop");
    // Traverse through each THREEjs model node
    tree3D.traverse(function(node){
      if (node.isMesh){ // If current node is mesh change its material's color to provided color
        console.log(node);
        node.material.color = new THREE.Color(colorr);
        console.log(node);
        }
    })
}
