// 총쏘는 함수
AFRAME.registerComponent("shooting", {
  init: function () {
    var el = this.el; // 각 변수 설정
    var data = this.data;
    var gunWrapper01 = document.querySelector("#gun-wrapper01");
    var gunWrapper02 = document.querySelector("#gun-wrapper02");
    var magazine01 = gunWrapper01.querySelectorAll("a-image");
    var magazine02 = gunWrapper02.querySelectorAll("a-image");

    var bullet1 = 10; // 첫번쨰 총으로 쏘면 총알이 10개 장전
    var bullet2 = 5; // 두번쨰 총으로 쏘면 총알이 5개 장전

    var newWidth = magazine01[11].getAttribute("geometry").width;
    var shooter = document.querySelector("#gun-shooter");
    var flag = true;
    document.body.addEventListener("click", function () {
      if (flag) {
        if (bullet1 > 0) {
          // 첫번쨰 총으로 쏘면 총알이 10개 장전
          el.emit("shoot");
          magazine01[bullet1].setAttribute("material", "opacity", "0.2");
          bullet1 -= 1;
        } else {
          // 총알이 없으면 0.5초 후에 10발 장전
          setTimeout(() => {
            bullet1 = 10;
            for (var i = 1; i < 11; i++) {
              magazine01[i].setAttribute("material", "opacity", "1");
            }
          }, 500);
        }
      } else {
        // 두번쨰 총으로 쏘면 총알이 5개 장전
        if (bullet2 > 0) {
          el.emit("shoot");
          //console.log(bulletNumber02);
          magazine02[6 - bullet2].setAttribute("material", "opacity", "0.2");
          bullet2 -= 1;
        } else {
          setTimeout(() => {
            // 총알이 없으면 1초 후에 5발 장전
            bullet2 = 5;
            for (var i = 1; i < 6; i++) {
              magazine02[i].setAttribute("material", "opacity", "1");
            }
          }, 1000);
        }
      }
    });
    shooter.addEventListener("componentchanged", function (evt) {
      //addEventListener은 이벤트를 등록 -> 오류 발생시 log남김
      if (evt.detail.name === "shooter") {
        flag = !flag;
        console.log(flag);
      }
    });
  },
});

//게임 시작하는 함수
AFRAME.registerComponent("starting", {
  schema: {
    newBoss: {
      type: "boolean",
      default: true,
    },
  },
  init: function () {
    var startInfo = document.querySelector("#start-info"); // 변수 설정
    var sceneEl = document.querySelector("a-scene");
    var startButton = document.querySelector("#start-button");
    var health = document.querySelector("#health");
    var healthPoints = health.querySelectorAll("a-image");
    var sceneEl = document.querySelector("a-scene");
    var el = this.el;
    var scoreEl = document.querySelector("[score-handler]");
    this.eventHandlerFn = function () {
      //보스 생성
      el.setAttribute("starting", "newBoss", true);
      console.log(el.getAttribute("starting").newBoss);

      console.log("hit");
      //시작하면 시작버튼 사라지기
      startInfo.setAttribute("visible", "false"); //child enetity can not be detacted.
      el.setAttribute("visible", "false");
      startInfo.object3D.position.set(0, 12, 0);
      // 점수 리셋
      scoreEl.setAttribute("score-handler", "score", 0);

      // 적들 생성
      for (var i = 0; i < 5; i++) {
        var enemy = document.createElement("a-entity");
        enemy.setAttribute("mixin", "enemy");
        enemy.setAttribute("class", "enemyGroup");
        sceneEl.appendChild(enemy);
        var healthBg = document.createElement("a-plane");
        healthBg.setAttribute("mixin", "health-bg");
        enemy.appendChild(healthBg);
        var healthPoint = document.createElement("a-entity");
        healthPoint.setAttribute("mixin", "health-point");
        healthPoint.setAttribute("id", "health-point");
        healthBg.appendChild(healthPoint);

        enemy.setAttribute("attack-handler", "flag", true);
        // 적들의 위치 랜덤으로 생성
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        var v = {
          x: Math.floor(Math.random() * plusOrMinus * 10),
          y: 0,
          z: Math.floor(Math.random() * 40 + 10),
        };
        enemy.object3D.position.set(v.x, 0, -v.z);
        enemy.setAttribute("animation", {
          property: "position",
          to: "" + v.x + " 0 " + "23" + "",
          dur: "" + v.z * 8000,
          easing: "easeOutCubic",
        });

        setTimeout(() => {
          //나는 적들도 생성

          var flyEnemy = document.createElement("a-entity");
          flyEnemy.setAttribute("mixin", "fly-enemy");
          flyEnemy.setAttribute("class", "enemyGroup");
          sceneEl.appendChild(flyEnemy);
          var flyHealthBg = document.createElement("a-plane");
          flyHealthBg.setAttribute("mixin", "fly-health-bg");
          flyEnemy.appendChild(flyHealthBg);
          var flyHealthPoint = document.createElement("a-entity");
          flyHealthPoint.setAttribute("mixin", "fly-health-point");
          flyHealthPoint.setAttribute("id", "health-point");
          flyHealthBg.appendChild(flyHealthPoint);

          flyEnemy.setAttribute("attack-handler", "flag", true);
          // 날으는 적들의 위치 랜덤 생성
          var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
          var v = {
            x: Math.floor(Math.random() * plusOrMinus * 10),
            y: 0,
            z: Math.floor(Math.random() * 40 + 10),
          };
          flyEnemy.object3D.position.set(v.x, 6, -v.z);
          flyEnemy.setAttribute("animation", {
            property: "position",
            to: "" + v.x + " 6 " + "23" + "",
            dur: "" + v.z * 2000,
            easing: "easeOutCubic",
          });
        }, 5000);
      }

      // 쏠때마다 1점 아웃
      health.setAttribute("health-check", "damage", -1);
      for (var i = 0; i < healthPoints.length; i++) {
        healthPoints[i].setAttribute("material", "opacity", "1");
      }
      // 가능한 적 추가하기
      sceneEl.setAttribute("add-enemy", "enabled", true);
      el.emit("ready");
      el.removeEventListener("hit", this.eventHandlerFn);
    };
    el.addEventListener("hit", this.eventHandlerFn);
  },

  //Boss 추가
  update: function () {
    var sceneEl = document.querySelector("a-scene");

    setInterval(() => {
      // 50초 후에 Boss 등장

      if (this.data.newBoss) {
        // 보스 위치 설정
        var enemyBoss = document.createElement("a-entity");
        enemyBoss.setAttribute("mixin", "enemy-boss");
        enemyBoss.setAttribute("class", "enemyBoss");
        enemyBoss.setAttribute("animation", {
          property: "position",
          from: "0 0 -60",
          to: "0 0 23",
          dur: "50000",
          easing: "easeOutCubic",
        });
        //등장시 소리 추가
        enemyBoss.setAttribute("sound", {
          src: "#spider-sound",
          autoplay: true,
          volume: 8,
        });

        sceneEl.appendChild(enemyBoss);
        var enemyBossHealthBg = document.createElement("a-entity");

        enemyBossHealthBg.setAttribute("mixin", "health-bg-boss");
        enemyBossHealthBg.setAttribute("id", "enemy-boss-health-bg");
        enemyBossHealthBg.setAttribute("position", "0 50 0");
        enemyBossHealthBg.setAttribute("sound", {
          src: "#boss-die-sound",
          volume: 8,
        });

        enemyBoss.appendChild(enemyBossHealthBg);
        var enemyBossHealthPoint = document.createElement("a-entity");
        enemyBossHealthPoint.setAttribute("id", "health-point-boss");
        enemyBossHealthPoint.setAttribute("mixin", "health-point-boss");
        enemyBossHealthBg.appendChild(enemyBossHealthPoint);
      }
    }, 50000);
  },
});

// 걷는 적 맞추기
AFRAME.registerComponent("hit-handler", {
  init: function () {
    var el = this.el;
    var health = el.querySelector("#health-point");
    var newWidth = 0;
    var healthPoint = el.getAttribute("target").healthPoints; // 변수 선언
    var gunShooter = document.querySelector("#gun-shooter");
    var damagePoint = healthPoint;
    var healthCheck = document.querySelector("[health-check]");
    var sceneEl = document.querySelector("a-scene");
    var scoreEl = document.querySelector("[score-handler]");
    el.addEventListener("hit", function () {
      var currentActiveBullet =
        gunShooter.getAttribute("shooter").activeBulletType;

      if (currentActiveBullet === "bullet01") {
        // 1번 총이면 -1

        if (damagePoint > 1) {
          // 적 생명이 1 이상이면
          newWidth = (damagePoint - 1) / healthPoint; // 노란색 생명선 너비 표시
          damagePoint -= 1;

          health.setAttribute("geometry", "width", newWidth);
          health.setAttribute("position", {
            x: -(1 - newWidth) / 2,
            y: 0,
            z: 0.01,
          });
        } else {
          // 적 죽으면

          el.setAttribute("animation-mixer", "clip", "death");
          el.setAttribute("animation-mixer", "loop", "once");
          health.setAttribute("visible", "false");
          el.components.sound.playSound();

          // 10점 추가하기
          var score = scoreEl.getAttribute("score-handler").score;
          score += 10;

          scoreEl.setAttribute("score-handler", "score", score);

          setTimeout(() => {
            // 1.5초 후에 새로운 enemy 추가하기
            el.parentNode.removeChild(el);
            var newDeadEnemyNumber =
              sceneEl.getAttribute("add-enemy").deadEnemyNumber;
            newDeadEnemyNumber += 1;
            sceneEl.setAttribute(
              "add-enemy",
              "deadEnemyNumber",
              newDeadEnemyNumber
            );
          }, 1500);
        }
      } else {
        // 2번 총이면 -5
        if (damagePoint > 1) {
          // 적 생명이 1 이상이면
          newWidth = (damagePoint - 1) / healthPoint;
          damagePoint -= 5;
          //console.log(damagePoint);
          health.setAttribute("geometry", "width", newWidth);
          health.setAttribute("position", {
            x: -(1 - newWidth) / 2,
            y: 0,
            z: 0.01,
          });
        } else {
          // 적 죽으면
          el.setAttribute("animation-mixer", "clip", "death");
          el.setAttribute("animation-mixer", "loop", "once");
          health.setAttribute("visible", "false");
          //점수 10점 추가하기
          var score = scoreEl.getAttribute("score-handler").score;
          score += 10;

          scoreEl.setAttribute("score-handler", "score", score);

          setTimeout(() => {
            el.parentNode.removeChild(el);
            var newDeadEnemyNumber =
              sceneEl.getAttribute("add-enemy").deadEnemyNumber;
            newDeadEnemyNumber += 1;
            sceneEl.setAttribute(
              "add-enemy",
              "deadEnemyNumber",
              newDeadEnemyNumber
            );
          }, 1500);
        }
      }
    });
    healthCheck.addEventListener("game-over", () => {
      el.parentNode.removeChild(el);
    });
  },
});

// 날으는 적 맞추는 함수
AFRAME.registerComponent("hit-handler-fly", {
  init: function () {
    var el = this.el;
    var health = el.querySelector("#health-point");
    var newWidth = 0;
    var healthPoint = el.getAttribute("target").healthPoints;
    var gunShooter = document.querySelector("#gun-shooter");
    var damagePoint = healthPoint;
    var healthCheck = document.querySelector("[health-check]");
    var sceneEl = document.querySelector("a-scene");
    var scoreEl = document.querySelector("[score-handler]");
    el.addEventListener("hit", function () {
      var currentActiveBullet =
        gunShooter.getAttribute("shooter").activeBulletType;

      if (currentActiveBullet === "bullet01") {
        if (damagePoint > 1) {
          newWidth = (damagePoint - 1) / healthPoint;
          damagePoint -= 1;

          health.setAttribute("geometry", "width", newWidth);
          health.setAttribute("position", {
            x: -(1 - newWidth) / 2,
            y: 0,
            z: 0.01,
          });
        } else {
          el.components.sound.playSound();
          //점수 5점 추가
          var score = scoreEl.getAttribute("score-handler").score;
          score += 5;

          scoreEl.setAttribute("score-handler", "score", score);

          el.setAttribute("visible", "false");
          setTimeout(() => {
            el.parentNode.removeChild(el);
            var newDeadEnemyNumber =
              sceneEl.getAttribute("add-enemy").deadEnemyNumber;
            newDeadEnemyNumber += 1;
            sceneEl.setAttribute(
              "add-enemy",
              "deadEnemyNumber",
              newDeadEnemyNumber
            );
          }, 1500);
        }
      } else {
        if (damagePoint > 1) {
          newWidth = (damagePoint - 1) / healthPoint;
          damagePoint -= 5;
          health.setAttribute("geometry", "width", newWidth);
          health.setAttribute("position", {
            x: -(1 - newWidth) / 2,
            y: 0,
            z: 0.01,
          });
        } else {
          el.components.sound.playSound();
          var score = scoreEl.getAttribute("score-handler").score;
          score += 10;

          scoreEl.setAttribute("score-handler", "score", score);
          el.setAttribute("visible", "false");
          setTimeout(() => {
            el.parentNode.removeChild(el);
            var newDeadEnemyNumber =
              sceneEl.getAttribute("add-enemy").deadEnemyNumber;
            newDeadEnemyNumber += 1;
            sceneEl.setAttribute(
              "add-enemy",
              "deadEnemyNumber",
              newDeadEnemyNumber
            );
          }, 1500);
        }
      }
    });
    healthCheck.addEventListener("game-over", () => {
      el.parentNode.removeChild(el);
    });
  },
});

// 보스 쏘기
AFRAME.registerComponent("hit-handler-boss", {
  init: function () {
    var el = this.el;
    var health = el.querySelector("#health-point-boss");
    var newWidth = 0;
    var healthPoint = el.getAttribute("target").healthPoints;
    var gunShooter = document.querySelector("#gun-shooter");
    var damagePoint = healthPoint;
    var sceneEl = document.querySelector("a-scene");
    var scoreEl = document.querySelector("[score-handler]");

    el.addEventListener("hit", function () {
      var currentActiveBullet =
        gunShooter.getAttribute("shooter").activeBulletType;
      if (currentActiveBullet === "bullet01") {
        if (damagePoint > 1) {
          newWidth = ((damagePoint - 1) / healthPoint) * 19;
          damagePoint -= 1;
          health.setAttribute("geometry", "width", newWidth);
          health.setAttribute("position", {
            x: -(19 - newWidth) / 2,
            y: 0,
            z: 1,
          });
        } else {
          el.removeAttribute("animation-mixer");
          el.removeAttribute("animation");

          health.setAttribute("visible", "false");
          // 점수 20점 추가
          var score = scoreEl.getAttribute("score-handler").score;
          score += 20;
          scoreEl.setAttribute("score-handler", "score", score);

          el.querySelector(
            "#enemy-boss-health-bg"
          ).components.sound.playSound();
          setTimeout(() => {
            el.parentNode.removeChild(el);
          }, 1500);
        }
      } else {
        if (damagePoint > 1) {
          newWidth = ((damagePoint - 1) / healthPoint) * 19;
          damagePoint -= 3;
          health.setAttribute("geometry", "width", newWidth);
          health.setAttribute("position", {
            x: -(19 - newWidth) / 2,
            y: 0,
            z: 1,
          });
        } else {
          el.removeAttribute("animation-mixer");
          el.removeAttribute("animation");
          health.setAttribute("visible", "false");
          var score = scoreEl.getAttribute("score-handler").score;
          score += 20;

          scoreEl.setAttribute("score-handler", "score", score);
          el.querySelector(
            "#enemy-boss-health-bg"
          ).components.sound.playSound();
          setTimeout(() => {
            el.parentNode.removeChild(el);
          }, 3000);
        }
      }
    });
  },
});

// shoot 함수 시, 소리 추가
AFRAME.registerComponent("sound-handler", {
  init: function () {
    var el = this.el;
    var gunSound01 = document.querySelector("#gun-sound01");
    el.addEventListener("shoot", function () {
      gunSound01.components.sound.playSound();
    });
  },
});

// 총쏘는 애니메이션( 생동감있게 총이 움직임 )
AFRAME.registerComponent("gun-animation-handler", {
  init: function () {
    var el = this.el;
    var gunWrapper = document.querySelector("#gun-wrapper01");

    el.addEventListener("shoot", () => {
      gunWrapper.setAttribute("animation-mixer", "clip", "fire");
      gunWrapper.setAttribute("animation-mixer", "loop", "once");
      setTimeout(() => {
        gunWrapper.removeAttribute("animation-mixer");
      }, 500);
    });
  },
});

// 총 바꾸는 함수
AFRAME.registerComponent("gun-change", {
  init: function () {
    var el = this.el;
    var dir = false;
    var gun01 = document.querySelector("#gun-wrapper01");
    var gun02 = document.querySelector("#gun-wrapper02");
    var gunShooter = document.querySelector("#gun-shooter");
    var gunSound = document.querySelector("#gun-sound01");
    var changeWeapon = function changeWeapon(e) {
      if (e.keyCode === 32) {
        if (dir) {
          gun01.setAttribute("animation__1", "enabled", "ture");
          gun01.setAttribute("animation__1", "dir", "reverse");
          gun01.setAttribute("animation__2", "enabled", "ture");
          gun01.setAttribute("animation__2", "dir", "reverse");

          gun02.setAttribute("animation__1", "enabled", "ture");
          gun02.setAttribute("animation__1", "dir", "reverse");
          gun02.setAttribute("animation__2", "enabled", "ture");
          gun02.setAttribute("animation__2", "dir", "reverse");
          gunShooter.setAttribute("position", "0.15225 -0.06 -0.1");
          gunShooter.setAttribute("shooter", "activeBulletType", "bullet01");
          gunSound.setAttribute("sound", "src", "#gun01-sound");
        } else {
          gun01.setAttribute("animation__1", "enabled", "ture");
          gun01.setAttribute("animation__1", "dir", "normal");
          gun01.setAttribute("animation__2", "enabled", "ture");
          gun01.setAttribute("animation__2", "dir", "normal");

          gun02.setAttribute("animation__1", "enabled", "ture");
          gun02.setAttribute("animation__1", "dir", "normal");
          gun02.setAttribute("animation__2", "enabled", "ture");
          gun02.setAttribute("animation__2", "dir", "normal");

          gunShooter.setAttribute("position", "0.152 -0.08 -0.42");
          gunShooter.setAttribute("shooter", "activeBulletType", "bullet02");
          gunSound.setAttribute("sound", "src", "#gun02-sound");
        }
        dir = !dir;
      }
    };
    window.addEventListener("keydown", changeWeapon);
  },
});

AFRAME.registerComponent("attack-handler", {
  schema: {
    flag: {
      type: "boolean",
      default: true,
    },
  },
  tick: function () {
    var sceneEl = document.querySelector("a-scene");
    if (this.data.flag) {
      var el = this.el;
      var data = this.data;
      var currentEnemyPosition = el.getAttribute("position");
      var enemyAlive = el.getAttribute("visible");
      var healthCheck = document.querySelector("[health-check]");
      if (currentEnemyPosition.z == 23 && enemyAlive) {
        el.parentNode.removeChild(el);
        var newDamage = healthCheck.getAttribute("health-check").damage;
        newDamage += 1;

        healthCheck.setAttribute("health-check", "damage", newDamage);
        this.data.flag = !this.data.flag;
      }
    }
  },
});

AFRAME.registerComponent("health-check", {
  schema: {
    damage: {
      type: "number",
      default: -1,
    },
  },
  update: function () {
    var el = this.el;
    var health = document.querySelector("#health");
    var healthPoints = health.querySelectorAll("a-image");
    if (this.data.damage < 2 && this.data.damage >= 0) {
      healthPoints[this.data.damage].setAttribute("material", "opacity", "0.2");
    } else if (this.data.damage == 2) {
      healthPoints[this.data.damage].setAttribute("material", "opacity", "0.2");
      el.emit("game-over");
    }
  },
});

AFRAME.registerComponent("game-over", {
  init: function () {
    var el = this.el;
    var startInfo = document.querySelector("#start-info");
    var startButton = document.querySelector("#start-button");
    startButton.addEventListener("ready", () => {
      var healthCheck = document.querySelector("#health");
      healthCheck.addEventListener("game-over", () => {
        var newBoss = document.querySelector("[starting]");
        // 적 삭제
        var enemyBoss = document.querySelector(".enemyBoss");
        enemyBoss.components.sound.stopSound();
        enemyBoss.parentNode.removeChild(enemyBoss);

        newBoss.setAttribute("starting", "newBoss", false);

        //적 추가 막기
        el.setAttribute("add-enemy", "enabled", false);
        startInfo.setAttribute("visible", "true");
        startInfo.object3D.position.set(0, 0, 0);
        startButton.setAttribute("visible", true);

        console.log("game over");
      });
    });
  },
});

// 적 추가하는 함수
AFRAME.registerComponent("add-enemy", {
  schema: {
    deadEnemyNumber: {
      type: "number",
      default: 0,
    },
    enabled: {
      type: "boolean",
      default: false,
    },
  },

  update: function () {
    var sceneEl = document.querySelector("a-scene");
    if (this.data.enabled) {
      var plusOrMinus = Math.random() < 0.5 ? -1 : 1;

      if (plusOrMinus == -1) {
        var enemy = document.createElement("a-entity");
        enemy.setAttribute("mixin", "enemy");
        enemy.setAttribute("class", "enemyGroup");
        sceneEl.appendChild(enemy);
        var healthBg = document.createElement("a-plane");
        healthBg.setAttribute("mixin", "health-bg");
        enemy.appendChild(healthBg);
        var healthPoint = document.createElement("a-entity");
        healthPoint.setAttribute("mixin", "health-point");
        healthPoint.setAttribute("id", "health-point");
        healthBg.appendChild(healthPoint);

        enemy.setAttribute("attack-handler", "flag", true);

        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        var v = {
          x: Math.floor(Math.random() * plusOrMinus * 10),
          y: 0,
          z: Math.floor(Math.random() * 40 + 10),
        };
        enemy.object3D.position.set(v.x, 0, -v.z);
        enemy.setAttribute("animation", {
          property: "position",
          to: "" + v.x + " 0 " + "23" + "",
          dur: "" + v.z * 3000,
          easing: "linear",
        });
        console.log("addEnemy");
      } else {
        var flyEnemy = document.createElement("a-entity");
        flyEnemy.setAttribute("mixin", "fly-enemy");
        flyEnemy.setAttribute("class", "enemyGroup");
        sceneEl.appendChild(flyEnemy);
        var flyHealthBg = document.createElement("a-plane");
        flyHealthBg.setAttribute("mixin", "fly-health-bg");
        flyEnemy.appendChild(flyHealthBg);
        var flyHealthPoint = document.createElement("a-entity");
        flyHealthPoint.setAttribute("mixin", "fly-health-point");
        flyHealthPoint.setAttribute("id", "health-point");
        flyHealthBg.appendChild(flyHealthPoint);

        flyEnemy.setAttribute("attack-handler", "flag", true);
        //적들의 위치 랜덤 생성
        var plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        var v = {
          x: Math.floor(Math.random() * plusOrMinus * 10),
          y: Math.floor(Math.random() * 4 + 10),
          z: Math.floor(Math.random() * 40 + 10),
        };
        flyEnemy.object3D.position.set(v.x, 6, -v.z);
        flyEnemy.setAttribute("animation", {
          property: "position",
          to: "" + v.x + " 6 " + "23" + "",
          dur: "" + v.z * 1000,
          easing: "easeOutCubic",
        });
        console.log("add-fly-Enemy");
      }
    }
  },
});

// 점수 다루는 함수
AFRAME.registerComponent("score-handler", {
  schema: {
    score: {
      type: "number",
      default: 0,
    },
  },
  update: function () {
    var el = this.el;
    var score = this.data.score;
    el.setAttribute("text", "value", score);
    console.log(score);
  },
});
