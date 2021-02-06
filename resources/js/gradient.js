import * as THREE from 'three';
import Editor from './Editor';

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(0, 1, 0, 1, 1, 1000);
const camera2 = new THREE.PerspectiveCamera(50, 1, 1, 1000);
camera2.position.z = 3;
camera2.position.x = 0.5;
camera2.position.y = 0.5;
camera2.lookAt(0.5, 0.5, 0);
scene.add(camera2);

let sceneCamera = camera;

const renderer = new THREE.WebGLRenderer();
const parentElement = document.querySelector('.gradient-mesh');
renderer.setSize(parentElement.clientWidth, parentElement.clientHeight);
renderer.domElement.style = '';
parentElement.insertBefore(renderer.domElement, parentElement.firstChild);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

camera.position.z = 10;
const patchDivCount = 20;

const initialDivisionCount = 3;
const editor = new Editor(initialDivisionCount, parentElement);

function transpose(matrix) {
  const w = matrix.length || 0;
  const h = matrix[0] instanceof Array ? matrix[0].length : 0;
  if (h === 0 || w === 0) { return []; }
  const t = [];

  for (let i = 0; i < h; i++) {
    t[i] = [];
    for (let j = 0; j < w; j++) {
      t[i][j] = matrix[j][i];
    }
  }
  return t;
}

function multiply(a, b) {
  const aNumRows = a.length;
  const aNumCols = a[0].length;
  const bNumRows = b.length;
  const bNumCols = b[0].length,
    m = new Array(aNumRows);  // initialize array of rows
  for (let r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (let c = 0; c < bNumCols; ++c) {
      m[r][c] = 0;             // initialize the current cell
      for (let i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}

const HM = [
  [2, -2, 1, 1],
  [-3, 3, -2, -1],
  [0, 0, 1, 0],
  [1, 0, 0, 0],
];

const HM_T = transpose(HM);

function getPatchAttribute(matrix, i, j, attributeName, tangentName) {
  if (tangentName) {
    return ([
      [matrix[i][j][attributeName], matrix[i + 1][j][attributeName], matrix[i][j][tangentName].negDir.x, matrix[i + 1][j][tangentName].posDir.x],
      [matrix[i][j + 1][attributeName], matrix[i + 1][j + 1][attributeName], matrix[i][j + 1][tangentName].negDir.x, matrix[i + 1][j + 1][tangentName].posDir.x],
      [matrix[i][j][tangentName].negDir.y, matrix[i + 1][j][tangentName].negDir.y, 0, 0],
      [matrix[i][j + 1][tangentName].posDir.y, matrix[i + 1][j + 1][tangentName].posDir.y, 0, 0],
    ]);
  }
  return ([
    [matrix[i][j][attributeName], matrix[i + 1][j][attributeName], 0, 0],
    [matrix[i][j + 1][attributeName], matrix[i + 1][j + 1][attributeName], 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ])
}

function getPatch(controlPoints, i, j) {
  const patch = {};
  patch.x = getPatchAttribute(controlPoints, i, j, 'x', 'uTangents');
  patch.y = getPatchAttribute(controlPoints, i, j, 'y', 'vTangents');
  patch.r = getPatchAttribute(controlPoints, i, j, 'r');
  patch.g = getPatchAttribute(controlPoints, i, j, 'g');
  patch.b = getPatchAttribute(controlPoints, i, j, 'b');
  return patch;
}

function getPatches(controlPoints) {
  const patches = [];
  const columnLength = controlPoints.length - 1;
  for (let i = 0; i < columnLength; i++) {
    const rowLength = controlPoints[i].length - 1;
    for (let j = 0; j < rowLength; j++) {
      const patch = getPatch(controlPoints, i, j);
      patches.push(patch);
    }
  }
  return patches;
}

function getPatchPoint(hermitePatch, u, v) {
  const Uvec = [[u ** 3], [u ** 2], [u], [1]];
  const Vvec = [[v ** 3], [v ** 2], [v], [1]];
  const vec = multiply(multiply(multiply(multiply(transpose(Uvec), HM), hermitePatch), HM_T), Vvec);
  return vec[0][0];
}

let allPatches = getPatches(editor.controlPointMatrix);
let hermitePatches = new THREE.Group();
let positionBufferAttribute = new THREE.BufferAttribute(new Float32Array([]), 3);
let colorBufferAttribute = new THREE.BufferAttribute(new Float32Array([]), 3);
const gradientMeshGeometry = new THREE.BufferGeometry();

const patchVertexCount = (patchDivCount + 1) * (patchDivCount + 1);
const patchFaceCount = patchDivCount * patchDivCount * 2;
const vertexCount = allPatches.length * patchFaceCount * 3;

let gradientMesh;
const vertexArray = new Array(vertexCount * 3);
const colorArray = new Array(vertexCount * 3);
const surfaceElements = new Array(patchVertexCount * 3);
const vertexColors = new Array(patchVertexCount * 3);
let vertices;
let colors;

function fillBufferAttributeByPatches(patches, positionAttr, colorAttr) {
  patches.forEach((patch, patchIndex) => {
    for (let i = 0; i <= patchDivCount; i++) {
      for (let j = 0; j <= patchDivCount; j++) {
        const x = getPatchPoint(patch.x, i / patchDivCount, j / patchDivCount);
        const y = getPatchPoint(patch.y, i / patchDivCount, j / patchDivCount);
        const r = getPatchPoint(patch.r, i / patchDivCount, j / patchDivCount);
        const g = getPatchPoint(patch.g, i / patchDivCount, j / patchDivCount);
        const b = getPatchPoint(patch.b, i / patchDivCount, j / patchDivCount);
        const z = (r + g + b) / 6;
        const baseIndex = ((i * (patchDivCount + 1)) + j) * 3;
        surfaceElements[baseIndex] = x;
        surfaceElements[baseIndex + 1] = y;
        surfaceElements[baseIndex + 2] = z;
        vertexColors[baseIndex] = r;
        vertexColors[baseIndex + 1] = g;
        vertexColors[baseIndex + 2] = b;
      }
    }
    for (let i = 0; i < patchDivCount; i++) {
      for (let j = 0; j < patchDivCount; j++) {
        const baseIndex = ((patchIndex * (patchFaceCount / 2)) + (i * patchDivCount) + j) * 6;
        /*
        v1----v3
        |   / |
        | /   |
        v2---v4
        */
        const v1_index = (i * (patchDivCount + 1) + j) * 3;
        setBufferAttributeFromArray(positionAttr, baseIndex, surfaceElements, v1_index);
        setBufferAttributeFromArray(colorAttr, baseIndex, vertexColors, v1_index);

        const v2_index = ((i + 1) * (patchDivCount + 1) + j) * 3;
        setBufferAttributeFromArray(positionAttr, baseIndex + 1, surfaceElements, v2_index);
        setBufferAttributeFromArray(colorAttr, baseIndex + 1, vertexColors, v2_index);

        setBufferAttributeFromArray(positionAttr, baseIndex + 3, surfaceElements, v2_index);
        setBufferAttributeFromArray(colorAttr, baseIndex + 3, vertexColors, v2_index);

        const v3_index = (i * (patchDivCount + 1) + (j + 1)) * 3;
        setBufferAttributeFromArray(positionAttr, baseIndex + 2, surfaceElements, v3_index);
        setBufferAttributeFromArray(colorAttr, baseIndex + 2, vertexColors, v3_index);

        setBufferAttributeFromArray(positionAttr, baseIndex + 4, surfaceElements, v3_index);
        setBufferAttributeFromArray(colorAttr, baseIndex + 4, vertexColors, v3_index);

        const v4_index = ((i + 1) * (patchDivCount + 1) + (j + 1)) * 3;
        setBufferAttributeFromArray(positionAttr, baseIndex + 5, surfaceElements, v4_index);
        setBufferAttributeFromArray(colorAttr, baseIndex + 5, vertexColors, v4_index);
      }
    }
  });
}

function initializeHermiteSurface() {
  fillBufferAttributeByPatches(allPatches, positionBufferAttribute, colorBufferAttribute);
  vertices = new Float32Array(vertexArray);
  colors = new Float32Array(colorArray);
  positionBufferAttribute.setArray(vertices);
  positionBufferAttribute.setDynamic(true);
  gradientMeshGeometry.addAttribute('position', positionBufferAttribute);

  colorBufferAttribute.setArray(colors);
  colorBufferAttribute.setDynamic(true);
  gradientMeshGeometry.addAttribute('color', colorBufferAttribute);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: THREE.VertexColors, side: THREE.DoubleSide });
  gradientMesh = new THREE.Mesh(gradientMeshGeometry, material);
  scene.add(gradientMesh);
  console.log(gradientMesh);
  gradientMesh.geometry.attributes.position.needsUpdate = true;
  gradientMesh.geometry.attributes.color.needsUpdate = true;
}

function setBufferAttributeFromArray(attr, attrIndex, array, vertexIndex) {
  attr.setXYZ(attrIndex, array[vertexIndex], array[vertexIndex + 1], array[vertexIndex + 2]);
}

function calculateHermiteSurface(t) {
  allPatches = getPatches(editor.controlPointMatrix);
  fillBufferAttributeByPatches(allPatches, gradientMesh.geometry.attributes.position, gradientMesh.geometry.attributes.color);
  gradientMesh.geometry.attributes.position.needsUpdate = true;
  gradientMesh.geometry.attributes.color.needsUpdate = true;
}
initializeHermiteSurface();

window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    calculateHermiteSurface();
    renderer.render(scene, sceneCamera);
  }
  if (e.code === 'Digit1') {
    calculateHermiteSurface();
    sceneCamera = camera;
    renderer.render(scene, sceneCamera);
  }
  if (e.code === 'Digit2') {
    calculateHermiteSurface();
    sceneCamera = camera2;
    renderer.render(scene, sceneCamera);
  }
  if (e.code === 'KeyR') {
    editor.resetSelectedCpTangent();
    calculateHermiteSurface();
    renderer.render(scene, sceneCamera);
  }
  if (e.code === 'KeyX') {
    editor.toggleCpXHandles();
    calculateHermiteSurface();
    renderer.render(scene, sceneCamera);
  }
  if (e.code === 'KeyY') {
    editor.toggleCpYHandles();
    calculateHermiteSurface();
    renderer.render(scene, sceneCamera);
  }
  if (e.code === 'KeyX' && e.altKey) {
    editor.resetCpXHandles();
    calculateHermiteSurface();
    renderer.render(scene, sceneCamera);
  }
  if (e.code === 'KeyY' && e.altKey) {
    editor.resetCpYHandles();
    calculateHermiteSurface();
    renderer.render(scene, sceneCamera);
  }
  if (e.code === 'ShiftLeft') {
    editor.toggleTangentBinding();
    calculateHermiteSurface();
    renderer.render(scene, sceneCamera);
  }
});


const animate = (t) => {
  if (editor.shouldRefresh) {
    calculateHermiteSurface(t);
    renderer.render(scene, sceneCamera);
  }
  requestAnimationFrame(() => animate(t + 0.05));
};

animate(0);

// UI Interaction

document.addEventListener('contextmenu', (e) => {
  e.preventDefault()
});

document.getElementById('btnAccept').addEventListener("click", () => {
  editor.toggleTangentBinding();
  calculateHermiteSurface();
  renderer.render(scene, sceneCamera);
  var meshGradientBase64 = document.querySelector('canvas').toDataURL('image/png', 1.0).replace("data:image/png;base64,", "");
  var patchPoints = JSON.stringify(allPatches).replace(/"/g, "'");
  window.postMessage("ConfirmMeshGradient", meshGradientBase64, patchPoints);
});

window.cancelAssignation = () => {
  window.postMessage('Cancel');
}

document.getElementById('btnCancel').addEventListener("click", () => {
  window.postMessage("nativeLog", "WV - Cancel");
  cancelAssignation();
});
