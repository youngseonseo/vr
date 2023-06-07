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
