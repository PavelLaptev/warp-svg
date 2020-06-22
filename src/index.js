import "./scss/styles.scss";
import "normalize.css";
import Warp from "warpjs";
import gsap from "gsap";
import Draggable from "gsap/Draggable";
import dropZone from "./dropzone";

import { testSVG } from "./assets/svg-test-strings";

gsap.registerPlugin(Draggable);

const svgContainer = document.getElementById("svg-container");
const svgElement = document.getElementById("svg-element");
const svgControl = document.getElementById("svg-control");

let width = svgContainer.clientWidth;
let height = svgContainer.clientHeight;

// console.log(width)

function parseSVGString(svgString) {
  const parser = new DOMParser();
  const svgDOM = parser.parseFromString(svgString, "image/svg+xml");
  const svgViewBox = svgDOM.firstChild.getAttribute("viewBox");
  const svgFill = svgDOM.firstChild.getAttribute("fill");

  const newContainerHeight = Math.round(
    width /
      (svgDOM.firstChild.getAttribute("width") /
        svgDOM.firstChild.getAttribute("height"))
  );
  svgContainer.style.height = `${newContainerHeight}px`;
  height = newContainerHeight;

  svgElement.setAttribute("viewBox", svgViewBox);
  svgElement.setAttribute("fill", svgFill);
  // console.log(svgDOM.firstChild.innerHTML.toString());
  svgElement.innerHTML = svgDOM.firstChild.innerHTML.toString();
}

function init(rawSVGstring) {
  const controlPath = document.getElementById("control-path");
  parseSVGString(rawSVGstring);

  // Need to interpolate first, so angles remain sharp
  const warp = new Warp(svgElement);
  warp.interpolate(6);

  // Start with a rectangle, then distort it later
  let controlPoints = [[0, 0], [0, height], [width, height], [width, 0]];

  // Funny things happen when control points are positioned perfectly on other points... buff it out
  // const controlBuffer = 4.8;
  // for (let i = 0; i < controlPoints.length; i++) {
  //   if (controlPoints[i][0] === 0) controlPoints[i][0] -= controlBuffer;
  //   if (controlPoints[i][1] === 0) controlPoints[i][1] -= controlBuffer;
  //   if (controlPoints[i][0] === width) controlPoints[i][0] += controlBuffer;
  //   if (controlPoints[i][1] === height) controlPoints[i][1] += controlBuffer;
  // }

  //
  // Compute weights from control points
  warp.transform(function(v0, V = controlPoints) {
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

    path.push("Z");
    element.setAttribute("d", path.join(""));
  }

  function drawCircle(element, pos = { x: 0, y: 0 }, index) {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttributeNS(null, "class", "control-point");
    circle.setAttributeNS(null, "cx", pos.x);
    circle.setAttributeNS(null, "cy", pos.y);
    circle.setAttributeNS(null, "r", 6);
    circle.setAttributeNS(
      null,
      "style",
      "fill: red; stroke: blue; stroke-width: 2px;"
    );
    element.appendChild(circle);

    Draggable.create(circle, {
      type: "x,y",
      // bounds: svgControl,
      onDrag: function() {
        // console.log({x: this.x, y: this.y})
        // console.log(width - this.pointerX)
        const relativeX =
          this.pointerX - svgControl.getBoundingClientRect().left;
        const relativeY =
          this.pointerY - svgControl.getBoundingClientRect().top;
        // console.log(relativeY);
        controlPoints[index] = [relativeX, relativeY];
        drawControlShape();
        warp.transform(reposition);
      }
    });
  }

  function drawControlPoints(element = svgControl, V = controlPoints) {
    controlPoints.map((i, index) => {
      drawCircle(element, { x: i[0], y: i[1] }, index);
      return null;
    });
  }

  const origControlPoints = JSON.parse(JSON.stringify(controlPoints));
  const radius = 20;
  let angle = 0;

  for (let i = 0; i < controlPoints.length; i++) {
    // const off = (origControlPoints[i][0] * origControlPoints[i][1]) / 1;
    controlPoints[i] = [
      origControlPoints[i][0] + radius * Math.cos(angle),
      origControlPoints[i][1] + radius * Math.sin(angle)
    ];
  }

  //
  drawControlShape();
  drawControlPoints();
  warp.transform(reposition);
}

init(testSVG);

dropZone(result => {
  svgControl.innerHTML = "";
  const newControlPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  newControlPath.setAttributeNS(null, "id", "control-path");
  svgControl.appendChild(newControlPath);
  init(result);
});
