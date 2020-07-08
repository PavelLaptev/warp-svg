/* eslint-disable quotes */
import "../scss/styles.scss";
import Warp from "warpjs";
import gsap from "gsap";
import Draggable from "gsap/Draggable";
import dropZone from "./chunks/dropzone";
import generateMeshPoints from "./chunks/generateMeshPoints";
import saveResult from "./chunks/saveResults";
import moveAndScaleCanvas from "./chunks/moveAndScaleCanvas";
import toggleControls from "./chunks/toggleControls";
import changeTheme from "./chunks/changeTheme";
import loader from "./chunks/loader";

import { testSVG } from "./chunks/svg-test-string";

/// /////////////////////////////////////////////////////////////////
/// /////////// Register GSAP Draggable and Loader //////////////////
/// /////////////////////////////////////////////////////////////////
loader();
gsap.registerPlugin(Draggable);

/// /////////////////////////////////////////////////////////////////
/// ///////////////////// Initial Variables /////////////////////////
/// /////////////////////////////////////////////////////////////////
let svgString = testSVG;
let zoom = 1;
const draggableControlPonts = [];

const app = document.getElementById("app");
const svgContainer = document.getElementById("svg-container");
const svgElement = document.getElementById("svg-element");
const svgControl = document.getElementById("svg-control");
const zoomElement = document.getElementById("scale-wrap");

const actions = {
  meshComplexity: document.getElementById("mesh-complexity"),
  showOriginalBox: document.getElementById("show-original-box-btn"),
};

let width = svgContainer.clientWidth;
let height = svgContainer.clientHeight;
let complexityLevel = actions.meshComplexity.value;

/// /////////////////////////////////////////////////////////////////
/// ///////////////////// Parse SVG String //////////////////////////
/// /////////////////////////////////////////////////////////////////
function parseSVGString(svgString) {
  const svgDOM = new DOMParser()
    .parseFromString(svgString, "image/svg+xml")
    .getElementsByTagName("svg")[0];

  const parsedSVGWidth = svgDOM.attributes.width
    ? Number(svgDOM.attributes.width.value.replace(/^.*?(\d+).*/, "$1"))
    : 500;
  const parsedSVGheight = svgDOM.attributes.height
    ? Number(svgDOM.attributes.height.value.replace(/^.*?(\d+).*/, "$1"))
    : 500;

  height = Math.round(parsedSVGheight);
  width = Math.round(parsedSVGWidth);
  svgContainer.style.height = `${Math.round(height)}px`;
  svgContainer.style.width = `${Math.round(width)}px`;

  svgDOM.attributes.viewBox
    ? svgElement.setAttribute("viewBox", svgDOM.attributes.viewBox.value)
    : false;
  svgDOM.attributes.fill
    ? svgElement.setAttribute("fill", svgDOM.attributes.fill.value)
    : svgElement.setAttribute("fill", "inherit");

  svgElement.setAttribute("preserveAspectRatio", "xMidYMin meet");
  svgElement.innerHTML = svgDOM.innerHTML.toString();
}

/// /////////////////////////////////////////////////////////////////
/// ///////////////////// Initial function //////////////////////////
/// /////////////////////////////////////////////////////////////////
function init(firstInit = false) {
  const controlPath = document.getElementById("control-path");
  parseSVGString(svgString);
  zoomElement.style.transform = "scale(1)";
  zoom = 1;

  // Need to interpolate first, so angles remain sharp
  const warp = new Warp(svgElement);
  warp.interpolate(200);

  // Start with a rectangle, then distort it later
  let controlPoints = generateMeshPoints(
    width,
    height,
    Number(complexityLevel)
  );

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

  // Draw control shape
  function drawControlShape(element = controlPath, V = controlPoints) {
    const path = [`M${V[0][0]} ${V[0][1]}`];

    for (let i = 1; i < V.length; i++) {
      path.push(`L${V[i][0]} ${V[i][1]}`);
    }

    path.push("Z");
    element.setAttribute("d", path.join(""));
  }

  // Draw control point
  function drawPoint(element, pos = { x: 0, y: 0 }, index) {
    const point = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    point.setAttributeNS(null, "class", "control-point");
    point.setAttributeNS(null, "cx", pos.x);
    point.setAttributeNS(null, "cy", pos.y);
    point.setAttributeNS(null, "r", 6);
    element.appendChild(point);

    draggableControlPonts.push(point);

    Draggable.create(point, {
      type: "x,y",
      onDrag: function () {
        const relativeX =
          (this.pointerX - svgControl.getBoundingClientRect().left) / zoom;
        const relativeY =
          (this.pointerY - svgControl.getBoundingClientRect().top) / zoom;

        controlPoints[index] = [relativeX, relativeY];
        drawControlShape();
        warp.transform(reposition);
      },
    });
  }

  // Place control points
  function drawControlPoints(element = svgControl, V = controlPoints) {
    V.map((i, index) => {
      drawPoint(element, { x: i[0], y: i[1] }, index);
      return null;
    });
  }

  // if this is the first launch
  if (firstInit) {
    controlPoints = [
      [-70, -5],
      [-2, 136],
      [-90, 200],
      [20, 380],
      [150, 260],
      [400, 400],
      [490, 250],
      [400, 90],
      [260, 6],
      [470, 80],
      [360, -40],
      [80, -90],
    ];
  }
  drawControlShape();
  drawControlPoints();
  warp.transform(reposition);
}

/// //////
const createNewControlPath = () => {
  svgControl.innerHTML = "";
  const newControlPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  newControlPath.setAttributeNS(null, "id", "control-path");
  svgControl.appendChild(newControlPath);
};

/// //////
dropZone((result) => {
  svgString = result;
  createNewControlPath();
  init();
});

/// ////
document.addEventListener("wheel", function (e) {
  const controlPath = document.getElementById("control-path");
  if (e.wheelDelta > 0) {
    zoomElement.style.transform = `scale(${(zoom += 0.02)})`;
    controlPath.style.strokeWidth = `${1 / zoom}px`;
    // console.log(svgControl.querySelectorAll('circle'));
  } else if (zoomElement.getBoundingClientRect().width >= 30) {
    zoomElement.style.transform = `scale(${(zoom -= 0.02)})`;
    controlPath.style.strokeWidth = `${1 / zoom}px`;
  }
  draggableControlPonts.map((i) => {
    if (i.getBoundingClientRect().height > 6) {
      i.setAttribute("r", 6 / zoom);
    }
  });
});

/// //////
actions.meshComplexity.addEventListener(
  "change",
  (e) => {
    complexityLevel = e.target.value;
    createNewControlPath();
    init();
  },
  false
);

/// /////
actions.showOriginalBox.addEventListener(
  "change",
  () => {
    svgControl.classList.toggle("show");
    app.classList.toggle("checkerboard-pattern");
  },
  false
);

// Initial calling
changeTheme();
moveAndScaleCanvas(svgContainer);
saveResult(document.getElementById("save-result-btn"), svgElement);
toggleControls();
init(true);
console.log(`
             ▄              ▄
           ▌▒█           ▄▀▒▌
           ▌▒▒█        ▄▀▒▒▒▐
           ▐▄▀▒▒▀▀▀▀▄▄▄▀▒▒▒▒▒▐
        ▄▄▀▒░▒▒▒▒▒▒▒▒▒█▒▒▄█▒▐
      ▄▀▒▒▒░░░▒▒▒░░░▒▒▒▀██▀▒▌
     ▐▒▒▒▄▄▒▒▒▒░░░▒▒▒▒▒▒▒▀▄▒▒▌
     ▌░░▌█▀▒▒▒▒▒▄▀█▄▒▒▒▒▒▒▒█▒▐
    ▐░░░▒▒▒▒▒▒▒▒▌██▀▒▒░░░▒▒▒▀▄▌
    ▌░▒▄██▄▒▒▒▒▒▒▒▒▒░░░░░░▒▒▒▒▌
   ▌▒▀▐▄█▄█▌▄░▀▒▒░░░░░░░░░░▒▒▒▐
   ▐▒▒▐▀▐▀▒░▄▄▒▄▒▒▒▒▒▒░▒░▒░▒▒▒▒▌
   ▐▒▒▒▀▀▄▄▒▒▒▄▒▒▒▒▒▒▒▒░▒░▒░▒▒▐
    ▌▒▒▒▒▒▒▀▀▀▒▒▒▒▒▒░▒░▒░▒░▒▒▒▌
     ▐▒▒▒▒▒▒▒▒▒▒▒▒▒▒░▒░▒░▒▒▄▒▒▐
      ▀▄▒▒▒▒▒▒▒▒▒▒▒░▒░▒░▒▄▒▒▒▒▌
        ▀▄▒▒▒▒▒▒▒▒▒▒▄▄▄▀▒▒▒▒▄▀
          ▀▄▄▄▄▄▄▀▀▀▒▒▒▒▒▄▄▀
             ▒▒▒▒▒▒▒▒▒▒▀▀

░░░░░░░  █░█ ▄▀█ █░░ █░░ █▀█ ░  ░░░░░░░
░░░░░░░  █▀█ █▀█ █▄▄ █▄▄ █▄█ █  ░░░░░░░
`);
