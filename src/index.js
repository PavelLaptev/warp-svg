import './scss/styles.scss';
import 'normalize.css';
import Warp from 'warpjs';
import gsap from 'gsap';
import Draggable from 'gsap/Draggable';
import dropZone from './dropzone';
import generateMeshPoints from './generateMeshPoints';
import saveResult from './saveResults';
import moveCanvas from './moveCanvas';
import toggleControls from './toggleControls';
import changeTheme from './changeTheme';
import loader from './loader';

import { testSVG } from './assets/svg-test-strings';

loader();

gsap.registerPlugin(Draggable);

let svgString = testSVG;
const svgContainer = document.getElementById('svg-container');
const svgElement = document.getElementById('svg-element');
const svgControl = document.getElementById('svg-control');

const actions = {
  meshComplexity: document.getElementById('mesh-complexity'),
  showOriginalBox: document.getElementById('show-original-box-btn'),
};

let width = svgContainer.clientWidth;
let height = svgContainer.clientHeight;
let complexityLevel = actions.meshComplexity.value;

function parseSVGString(svgString) {
  const parser = new DOMParser();
  const svgDOM = parser
    .parseFromString(svgString, 'image/svg+xml')
    .getElementsByTagName('svg')[0];
  const svgViewBox = svgDOM.attributes.viewBox.value;
  const svgFill = svgDOM.attributes.fill
    ? svgDOM.attributes.fill.value
    : 'none';

  // console.log(svgDOM.children);
  // console.log(svgElement);
  const parsedSVGWidth = svgDOM.attributes.width
    ? svgDOM.attributes.width.value
    : 500;
  const parsedSVGheight = svgDOM.attributes.height
    ? svgDOM.attributes.height.value
    : 500;

  const newContainerHeight = Math.round(
    width / (parsedSVGWidth / parsedSVGheight)
  );
  svgContainer.style.height = `${newContainerHeight}px`;
  height = newContainerHeight;

  svgElement.setAttribute('viewBox', svgViewBox);
  svgElement.setAttribute('fill', svgFill);
  svgElement.innerHTML = svgDOM.innerHTML.toString();
}

function init(firstInit = false) {
  const controlPath = document.getElementById('control-path');
  parseSVGString(svgString);
  console.log(`first init is ${firstInit}`);

  // Need to interpolate first, so angles remain sharp
  const warp = new Warp(svgElement);
  warp.interpolate(40);

  // Start with a rectangle, then distort it later
  let controlPoints = generateMeshPoints(
    width,
    height,
    Number(complexityLevel)
  );

  //
  // Compute weights from control points
  warp.transform(function (v0, V = controlPoints) {
    const A = [];
    const W = [];
    const L = [];

    // Find angles
    for (let i = 0; i < V.length; i++) {
      const j = (i + 1) % V.length;

      const vi = V[i];
      const vj = V[j];

      const r0i = Math.sqrt((v0[0] - vi[0]) ** 2 + (v0[1] - vi[1]) ** 2);
      const r0j = Math.sqrt((v0[0] - vj[0]) ** 2 + (v0[1] - vj[1]) ** 2);
      const rij = Math.sqrt((vi[0] - vj[0]) ** 2 + (vi[1] - vj[1]) ** 2);

      const dn = 2 * r0i * r0j;
      const r = (r0i ** 2 + r0j ** 2 - rij ** 2) / dn;

      A[i] = isNaN(r) ? 0 : Math.acos(Math.max(-1, Math.min(r, 1)));
    }

    // Find weights
    for (let j = 0; j < V.length; j++) {
      const i = (j > 0 ? j : V.length) - 1;

      // const vi = V[i];
      const vj = V[j];

      const r = Math.sqrt((vj[0] - v0[0]) ** 2 + (vj[1] - v0[1]) ** 2);

      W[j] = (Math.tan(A[i] / 2) + Math.tan(A[j] / 2)) / r;
    }

    // Normalise weights
    const Ws = W.reduce((a, b) => a + b, 0);
    for (let i = 0; i < V.length; i++) {
      L[i] = W[i] / Ws;
    }

    // Save weights to the point for use when transforming
    return [...v0, ...L];
  });

  //
  // Warp function
  function reposition([x, y, ...W], V = controlPoints) {
    let nx = 0;
    let ny = 0;

    // Recreate the points using mean value coordinates
    for (let i = 0; i < V.length; i++) {
      nx += W[i] * V[i][0];
      ny += W[i] * V[i][1];
    }

    return [nx, ny, ...W];
  }

  function drawControlShape(element = controlPath, V = controlPoints) {
    const path = [`M${V[0][0]} ${V[0][1]}`];

    for (let i = 1; i < V.length; i++) {
      path.push(`L${V[i][0]} ${V[i][1]}`);
    }

    path.push('Z');
    element.setAttribute('d', path.join(''));
  }

  function drawCircle(element, pos = { x: 0, y: 0 }, index) {
    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );
    circle.setAttributeNS(null, 'class', 'control-point');
    circle.setAttributeNS(null, 'cx', pos.x);
    circle.setAttributeNS(null, 'cy', pos.y);
    circle.setAttributeNS(null, 'r', 6);
    element.appendChild(circle);

    Draggable.create(circle, {
      type: 'x,y',
      // bounds: svgControl,
      onDrag: function () {
        const relativeX =
          this.pointerX - svgControl.getBoundingClientRect().left;
        const relativeY =
          this.pointerY - svgControl.getBoundingClientRect().top;
        controlPoints[index] = [relativeX, relativeY];
        drawControlShape();
        warp.transform(reposition);
      },
    });
  }

  function drawControlShapes(element = svgControl, V = controlPoints) {
    V.map((i, index) => {
      drawCircle(element, { x: i[0], y: i[1] }, index);
      return null;
    });
  }

  //
  if (firstInit) {
    controlPoints = [
      [-40, 70],
      [10, 180],
      [-20, 275],
      [130, 420],
      [160, 184],
      [400, 470],
      [540, 350],
      [450, 90],
      [260, 6],
      [500, 30],
      [460, -10],
      [110, -80],
    ];
  }
  drawControlShape();
  drawControlShapes();
  warp.transform(reposition);
}

const createNewControlPath = () => {
  svgControl.innerHTML = '';
  const newControlPath = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'path'
  );
  newControlPath.setAttributeNS(null, 'id', 'control-path');
  svgControl.appendChild(newControlPath);
};

/////////
dropZone((result) => {
  svgString = result;
  createNewControlPath();
  init();
});

/////////
actions.meshComplexity.addEventListener(
  'change',
  (e) => {
    complexityLevel = e.target.value;
    createNewControlPath();
    init();
  },
  false
);

////////
actions.showOriginalBox.addEventListener(
  'change',
  () => {
    svgControl.classList.toggle('show');
    console.log(actions.showOriginalBox.checked);
  },
  false
);

changeTheme();
toggleControls();
moveCanvas(svgContainer);
saveResult(document.getElementById('save-result-btn'), svgElement);
init(true);
