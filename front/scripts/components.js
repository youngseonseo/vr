AFRAME.registerComponent("me", {
  schema: {
    default: { x: 0, y: 0, z: 0 },
  },
  init: function () {
    console.log("hi");
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    var camera = document.querySelector("a-camera");
  },
  tick: function () {
    /*
      console.log(
        JSON.stringify(this.el.getAttribute("position")) !==
          JSON.stringify(this.position)
      );
      //console.log(JSON.stringify(this.el.getAttribute("position")));
      //console.log(JSON.stringify(this.position));*/
    if (
      JSON.stringify(this.el.getAttribute("position")) !==
      JSON.stringify(this.position)
    ) {
      this.position = JSON.parse(
        JSON.stringify(this.el.getAttribute("position"))
      );
      socket.emit("movement", { position: this.position });
    }

    if (
      JSON.stringify(this.el.getAttribute("rotation")) !==
      JSON.stringify(this.rotation)
    ) {
      this.rotation = JSON.parse(
        JSON.stringify(this.el.getAttribute("rotation"))
      );
      socket.emit("rotation", { rotation: this.rotation });
    }
  },
});
