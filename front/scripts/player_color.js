// Component for player to change its color
AFRAME.registerComponent('treeman', {
    schema: {
        colorr: {type: 'string', default: 'black'},
    },
    init: function(){
        let el = this.el;
        let self = this;

        let colorr = this.data.colorr;

        el.addEventListener("changecolor", e =>{
          console.log(colorr);
          var color;

          switch (colorr) {
            case "red":
              color = "rgb(224, 0, 0)"
              break;
            case "green":
              color = "rgb(15, 224, 0)"
              break;
            case "black":
              color = "rgb(0, 0, 0)"
              break;
            case "blue":
              color = "rgb(0, 32, 148)"
              break;
            case "yellow":
              color = "rgb(182, 224, 27)"
              break;
            case "purple":
              color = "rgb(2205, 27, 224)"
              break;
            case "orange":
              color = "rgb(224, 145, 27)"
              break;
            case "brown":
              color = "rgb(61, 39, 6)"
              break;
            case "white":
              color = "rgb(255, 255, 255)"
              break;
            case "pink":
              color = "rgb(217, 22, 207)"
              break;
            case "lime":
              color =  "rgb(72, 232, 60)"
              break;
            case "grey":
              color = "rgb(59, 59, 59)"
              break;
          }
          console.log(color);

          let tree3D = el.getObject3D('mesh'); // Get THREEjs object from GLTF model
          if (!tree3D){return;}    
          // Traverse through each THREEjs model node
          tree3D.traverse(function(node){
            if (node.isMesh){ // If current node is mesh change its material's color to provided color
              node.material.color = new THREE.Color(color);
              }
          })
        })
    }})