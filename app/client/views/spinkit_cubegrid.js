const html = require('choo/html')
const css = require('csjs-inject')

const style = css`

.skCubeGrid {
  display: block;
  width: 40px;
  height: 40px;
  margin: 100px auto;
}

.skCubeGrid .skCube {
  width: 33%;
  height: 33%;
  background-color: white;
  float: left;
  -webkit-animation: skCubeGridScaleDelay 1.3s infinite ease-in-out;
}
.skCubeGrid .skCube1 {
  -webkit-animation-delay: 0.2s;
}
.skCubeGrid .skCube2 {
  -webkit-animation-delay: 0.3s;
}
.skCubeGrid .skCube3 {
  -webkit-animation-delay: 0.4s;
}
.skCubeGrid .skCube4 {
  -webkit-animation-delay: 0.1s;
}
.skCubeGrid .skCube5 {
  -webkit-animation-delay: 0.2s;
}
.skCubeGrid .skCube6 {
  -webkit-animation-delay: 0.3s;
}
.skCubeGrid .skCube7 {
  -webkit-animation-delay: 0s;
}
.skCubeGrid .skCube8 {
  -webkit-animation-delay: 0.1s;
}
.skCubeGrid .skCube9 {
  -webkit-animation-delay: 0.2s;
}

@-webkit-keyframes skCubeGridScaleDelay {
  0%, 70%, 100% {
    -webkit-transform: scale3D(1, 1, 1);
  } 35% {
    -webkit-transform: scale3D(0, 0, 1);
  }
}

@keyframes skCubeGridScaleDelay {
  0%, 70%, 100% {
    -webkit-transform: scale3D(1, 1, 1);
  } 35% {
    -webkit-transform: scale3D(0, 0, 1);
  }
}

`

module.exports = html`

<div class="${style.skCubeGrid}">
  <div class="${style.skCube} ${style.skCube1}"></div>
  <div class="${style.skCube} ${style.skCube2}"></div>
  <div class="${style.skCube} ${style.skCube3}"></div>
  <div class="${style.skCube} ${style.skCube4}"></div>
  <div class="${style.skCube} ${style.skCube5}"></div>
  <div class="${style.skCube} ${style.skCube6}"></div>
  <div class="${style.skCube} ${style.skCube7}"></div>
  <div class="${style.skCube} ${style.skCube8}"></div>
  <div class="${style.skCube} ${style.skCube9}"></div>
</div>

`
