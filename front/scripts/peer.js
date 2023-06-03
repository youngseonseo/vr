var mediaStream;
var peer = new Peer();
var connections = {};
var calls = {};
function findCaller(peerid) {
  return document.querySelector(`[peerid="${peerid}"]`).getAttribute("id");
}

peer.on("open", function (id) {
  console.log("My peer ID is: " + id);
  socket.emit("peerId", { id: id });
});

peer.on("connection", (conn) => {
  let caller = findCaller(conn.peer);
  console.log(`adding ${conn.peer} to ${caller}`);
  connections[caller] = conn;
});

peer.on("call", function (call) {
  // Answer the call, providing our mediaStream
  let caller = findCaller(call.peer);
  connections[caller] = call;
  call.answer(mediaStream);
  call.on("stream", (stream) => {
    /*var audio = document.createElement("audio");
    audio.setAttribute("id", `${call.peer}_stream`);
    audio.srcObject = stream;
    audio.autoplay = true;
    audio.play();
    console.log("receiving stream");
    console.log(audio);
    window.peerStream = stream;
    console.log(window.peerStream);
    window.audios.appendChild(audio);*/
    var peerAudio = document.getElementById("peerAudio");
    peerAudio.srcObject = stream;
    peerAudio.autoplay = true;
    window.peerStream = stream;
    console.log(peerAudio.srcObject);
  });
});

function getLocalStream() {
  navigator.mediaDevices
    .getUserMedia({ video: false, audio: true })
    .then((stream) => {
      window.localStream = stream; // A
      window.myMic.srcObject = stream; // B
      window.myMic.autoplay = true; // C
      window.myMic.mute = true;
    })
    .catch((err) => {
      console.error(`you got an error: ${err}`);
    });
}
getLocalStream();
