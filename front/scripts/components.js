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

AFRAME.registerComponent("linkportal", {
  schema: {
    href: { type: "string" },
    timer: { type: "string" },
  },
  init: function () {
    console.log(this.data);
    this.href = this.data.href;
    this.el.addEventListener("click", () => {
      console.log("navigating");
      window.location.href = this.href;
    });
    this.el.addEventListener("triggerdown", () => {
      console.log("navigating");
      window.location.href = this.href;
    });
    this.el.addEventListener("mouseenter", () => {
      console.log("navigating");
      const cursor = document.getElementById("cursor");
      cursor.setAttribute(
        "animation",
        `property: scale; to: 0 0 0; dur: ${config.linkTime}`
      );
      cursor.setAttribute("material", { color: `red` });
      this.el.setAttribute("material", { color: "red" });
      this.timer = window.setTimeout(() => {
        console.log("timedout");
        cursor.removeAttribute("animation");
        window.location.href = this.href;
      }, config.linkTime);
      console.log(this.timer);
    });
    this.el.addEventListener("mouseleave", () => {
      const cursor = document.getElementById("cursor");
      this.el.setAttribute("material", { color: "black" });
      cursor.removeAttribute("animation");
      cursor.setAttribute("scale", "1 1 1");
      cursor.setAttribute("material", { color: `black` });
      window.clearTimeout(this.timer);
    });
  },
});

AFRAME.registerComponent("player", {
  schema: {
    timer: { type: "string" },
  },
  init: function () {},
  animate: function (id, animation) {
    var target = document.getElementById(`${id}-texture`);
    var model = target.getAttribute("model");
    target.setAttribute(
      "animation-mixer",
      `clip: ${animations[model][animation]}`
    );
  },
  moveAnimation: function (id) {
    window.clearTimeout(this.timer);
    this.animate(id, "walk");
    this.timer = window.setTimeout(this.animate, 100, id, "idle");
  },
});
