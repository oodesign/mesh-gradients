import * as THREE from 'three';
import Editor from './Editor';
var MeshLine = require('three.meshline');
const AColorPicker = require('a-color-picker');


let initialDivisionCount = 2;
let customDivisionCount = 2;
let establishedCollectionGradientId = 1;
var accentColor = 0x235FFF;
let customColors = ["#FFffff", "#3a69fd", "#00ffa2", "#00FFFF"];
var editor;

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(0, 1, 0, 1, 1, 1000);
camera.position.z = 10;
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

const meshGradientMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: THREE.VertexColors, side: THREE.DoubleSide });
const wireframeMeshMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  opacity: 0.5,
  polygonOffset: true,
  polygonOffsetFactor: 1, // positive value pushes polygon further away
  polygonOffsetUnits: 1,
  transparent: true,
});

const renderer = new THREE.WebGLRenderer({ alpha: true });
const parentElement = document.querySelector('.gradient-mesh');
const colorPickerContainer = document.querySelector('.aColorPicker');
// renderer.setSize(parentElement.clientWidth, parentElement.clientHeight);
const imageQuality = 5000;
renderer.setSize(imageQuality, imageQuality);
renderer.domElement.style = '';
parentElement.insertBefore(renderer.domElement, parentElement.firstChild);

const patchDivCount = 30;
const patchVertexCount = (patchDivCount + 1) * (patchDivCount + 1);
const patchFaceCount = patchDivCount * patchDivCount * 2;
var vertexCount;

let allPatches = null;
let hermitePatches = new THREE.Group();
let positionBufferAttribute;
let colorBufferAttribute;
let gradientMeshGeometry = new THREE.BufferGeometry();

let gradientMesh;
var vertexArray
var colorArray;
let surfaceElements = new Array(patchVertexCount * 3);
let vertexColors = new Array(patchVertexCount * 3);
let vertices;
let colors;

initializeCustomColors();
addMeshSizeListeners();

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
  allPatches = getPatches(editor.controlPointMatrix);
  vertexCount = allPatches.length * patchFaceCount * 3;
  vertexArray = new Array(vertexCount * 3);
  colorArray = new Array(vertexCount * 3);
  vertices = new Float32Array(vertexArray);
  colors = new Float32Array(colorArray);

  positionBufferAttribute = new THREE.BufferAttribute(new Float32Array([]), 3);
  colorBufferAttribute = new THREE.BufferAttribute(new Float32Array([]), 3);

  fillBufferAttributeByPatches(allPatches, positionBufferAttribute, colorBufferAttribute);

  positionBufferAttribute.setArray(vertices);
  positionBufferAttribute.setDynamic(true);
  gradientMeshGeometry.addAttribute('position', positionBufferAttribute);

  colorBufferAttribute.setArray(colors);
  colorBufferAttribute.setDynamic(true);
  gradientMeshGeometry.addAttribute('color', colorBufferAttribute);
  scene.remove(gradientMesh);
  gradientMesh = new THREE.Mesh(gradientMeshGeometry, meshGradientMaterial);
  scene.add(gradientMesh);

  gradientMesh.geometry.attributes.position.needsUpdate = true;
  gradientMesh.geometry.attributes.color.needsUpdate = true;


  drawLines();
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

function log(message) {
  window.postMessage("nativeLog", message);
}

function log2(message) {
  document.getElementById("logger").innerHTML = " - " + message;
}

window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case "KeyM":
      gradientMesh.material = (gradientMesh.material == meshGradientMaterial) ? wireframeMeshMaterial : meshGradientMaterial;
      document.getElementById("showMesh").innerHTML = (gradientMesh.material == meshGradientMaterial) ? "Show mesh" : "Hide mesh";
      calculateHermiteSurface();
      renderer.render(scene, camera);
      break;
    case "Space":
      toggleLines();
      break;
  }
});


window.addEventListener('load', (e) => {
  setEditorScenario();
  setTimeout(setEditorScenario, 100);
});

window.addEventListener('resize', (e) => {
  setEditorScenario();
});

function setEditorScenario() {
  var meshEditor = document.getElementById("meshEditor");
  var gradientMesh = document.getElementById("gradientMesh");

  var newSize = (meshEditor.clientWidth > meshEditor.clientHeight) ? meshEditor.clientHeight : meshEditor.clientWidth;

  gradientMesh.style.width = newSize - 60 + "px";
  gradientMesh.style.height = newSize - 70 + "px";
  gradientMesh.style.top = (meshEditor.clientHeight - newSize) / 2 + 20 + "px";
  gradientMesh.style.left = (meshEditor.clientWidth - newSize) / 2 + 30 + "px";

  if (!editor || !editor.controlPointArray)
    setTimeout(setEditorScenario, 50);
  else {
    editor.boundingRect = gradientMesh.getBoundingClientRect();
    editor.controlPointArray.forEach(cp => updateCPlines(cp));
  }
}

const animate = (t) => {

  if (editor.currentlyMovingCp || editor.currentlyMovingTangent) {
    updateCPlines(editor.selectedCp);
  }

  if (editor.shouldRefresh) {
    calculateHermiteSurface(t);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(() => animate(t + 0.05));

  document.getElementById("gradientEdited").innerHTML = editor.hasChanges ? "*" : "";
};


// UI Interaction

document.addEventListener('contextmenu', (e) => {
  //e.preventDefault()
});


document.getElementById('btnResetCurves').addEventListener("click", () => {
  editor.selectedCp.setSymmetricTangents();
  editor.resetSelectedCpTangent();
  editor.updateTangentButtons();
  updateCPlines(editor.selectedCp);
  calculateHermiteSurface();
  renderer.render(scene, camera);
});

document.getElementById('btnSymmetric').addEventListener("click", () => {
  editor.hasChanges = true;
  editor.multipleSelectedCPs.forEach(cp => {
    cp.setSymmetricTangents()
  });
  editor.updateTangentButtons(true);
});

document.getElementById('btnAsymmetric').addEventListener("click", () => {
  editor.hasChanges = true;
  editor.multipleSelectedCPs.forEach(cp => {
    cp.setAsymmetricTangents()
  });
  editor.updateTangentButtons(false);
});


document.getElementById('btnAccept').addEventListener("click", () => {
  editor.toggleTangentBinding();
  if (linesVisible) toggleLines();
  gradientMesh.material = meshGradientMaterial;
  calculateHermiteSurface();
  renderer.render(scene, camera);

  var meshGradientBase64 = document.querySelector('canvas').toDataURL('image/png', 1.0).replace("data:image/png;base64,", "");

  var pointMatrix = JSON.stringify(editor.getStorePointArray());
  window.postMessage("ConfirmMeshGradient", meshGradientBase64, pointMatrix);
});

window.cancelAssignation = () => {
  window.postMessage('Cancel');
}

document.getElementById('btnCancel').addEventListener("click", () => {
  window.postMessage("nativeLog", "WV - Cancel");
  cancelAssignation();
});

let gradientCollection = [], customGradientCollection = [];

window.LoadMesh = (meshGradientDefinition, gradients, customGradients) => {

  if (meshGradientDefinition != null) {
    var parsed = JSON.parse(meshGradientDefinition);
    initialDivisionCount = Math.sqrt(parsed.length) - 1
  }
  editor = new Editor(initialDivisionCount, parentElement, colorPickerContainer, meshGradientDefinition, document.getElementById("btnSymmetric"), document.getElementById("btnAsymmetric"), document.getElementById("controlPointEditor"), customColors);
  document.getElementById("collectionContent").innerHTML = "";
  gradientCollection = gradients;
  customGradientCollection = customGradients;
  drawGradientCollection("Library", gradientCollection);
  initializeHermiteSurface();
  animate(0);
}

window.ChangeGradient = (meshGradientDefinition) => {
  if (meshGradientDefinition != null) {
    var parsed = JSON.parse(meshGradientDefinition);
    let newDivisionCount = Math.sqrt(parsed.length) - 1;
    editor.changeDivisionCount(newDivisionCount);
    editor.loadControlPoints(meshGradientDefinition);
    initializeHermiteSurface();
    editor.shouldRefresh = true;
  }
}

function drawGradientCollection(title, collection) {

  var items = "";

  let section = document.createElement("div");
  section.className = "rowAuto contentSection";
  let verticalLayout = document.createElement("div");
  verticalLayout.className = "verticalLayout";
  let titleRow = document.createElement("div");
  titleRow.className = "rowAuto primaryText titleSpacing";
  titleRow.innerHTML = title;
  let thumbnails = document.createElement("div");
  thumbnails.className = "rowAuto gradientCollectionContainer";

  verticalLayout.appendChild(titleRow);
  verticalLayout.appendChild(thumbnails);
  section.appendChild(verticalLayout);

  collection.forEach(g => {
    let thumbnail = document.createElement("div");
    thumbnail.id = "gradientThumbnail" + g.id;
    thumbnail.className = "gradientThumbnail" + ((thumbnails.childElementCount == 0) ? " selected" : "");
    let img = document.createElement("img");
    img.src = `../thumbnails/${g.thumbnail}`;
    thumbnail.addEventListener("click", function () { confirmAction(requestChangeGradient, { "id": g.id }) })
    thumbnail.appendChild(img);
    thumbnails.appendChild(thumbnail);
  });

  document.getElementById("collectionContent").appendChild(section);
}

function requestChangeGradient(parameters) {
  let id = parameters.id;
  establishedCollectionGradientId = id;

  gradientCollection.forEach(g => {
    document.getElementById("gradientThumbnail" + g.id).classList.remove("selected");
  });
  document.getElementById("gradientThumbnail" + establishedCollectionGradientId).classList.add("selected");

  window.postMessage("ChangeGradient", id);
}

let horizontalLines = new Map();
let verticalLines = new Map();
const coolmaterial = new THREE.LineBasicMaterial({ color: accentColor, linewidth: 8 });
let line;
let linesVisible = false;


const toggleLines = () => {
  // window.postMessage("nativeLog", "toggle lines")
  linesVisible = !linesVisible;
  document.getElementById("showGrid").innerHTML = linesVisible ? "Hide grid" : "Show grid";

  horizontalLines.forEach(hLine => {
    hLine.visible = linesVisible;
  });

  verticalLines.forEach(vLine => {
    vLine.visible = linesVisible;
  });


  renderer.render(scene, camera);
}

let lines = [];

const drawLines = () => {

  lines.forEach(line => { scene.remove(line); });
  lines = [];

  // window.postMessage("nativeLog", "creating lines")
  for (let i = 0; i < editor.controlPointMatrix.length; i++) {
    for (let j = 0; j < editor.controlPointMatrix[i].length - 1; j++) {

      let p1 = editor.controlPointMatrix[i][j];
      let p2 = editor.controlPointMatrix[i][j + 1];

      var p1VTanPosDirX = (p1.vTangents.posDir.x * 100 + p1.x * editor.boundingRect.width) / editor.boundingRect.width;
      var p1VTanPosDirY = (p1.vTangents.posDir.y * 100 + p1.y * editor.boundingRect.height) / editor.boundingRect.height;
      var p2VTanNegDirX = (p2.vTangents.negDir.x * -100 + p2.x * editor.boundingRect.width) / editor.boundingRect.width;
      var p2VTanNegDirY = (p2.vTangents.negDir.y * -100 + p2.y * editor.boundingRect.height) / editor.boundingRect.height;

      let curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(p1.x, p1.y, 2),
        new THREE.Vector3(p1VTanPosDirX, p1VTanPosDirY, 2),
        new THREE.Vector3(p2VTanNegDirX, p2VTanNegDirY, 2),
        new THREE.Vector3(p2.x, p2.y, 2)
      );

      let geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      let curveObject = new THREE.Line(geometry, coolmaterial);
      curveObject.curve = curve;
      curveObject.visible = linesVisible;
      scene.add(curveObject);
      verticalLines.set(i + "," + j, curveObject);
      lines.push(curveObject);
    }
  }

  for (let i = 0; i < editor.controlPointMatrix.length - 1; i++) {
    for (let j = 0; j < editor.controlPointMatrix[i].length; j++) {

      let p1 = editor.controlPointMatrix[i][j];
      let p2 = editor.controlPointMatrix[i + 1][j];

      var p1UTanPosDirX = (p1.uTangents.posDir.x * 100 + p1.x * editor.boundingRect.width) / editor.boundingRect.width;
      var p1UTanPosDirY = (p1.uTangents.posDir.y * 100 + p1.y * editor.boundingRect.height) / editor.boundingRect.height;
      var p2UTanNegDirX = (p2.uTangents.negDir.x * -100 + p2.x * editor.boundingRect.width) / editor.boundingRect.width;
      var p2UTanNegDirY = (p2.uTangents.negDir.y * -100 + p2.y * editor.boundingRect.height) / editor.boundingRect.height;

      let curve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(p1.x, p1.y, 2),
        new THREE.Vector3(p1UTanPosDirX, p1UTanPosDirY, 2),
        new THREE.Vector3(p2UTanNegDirX, p2UTanNegDirY, 2),
        new THREE.Vector3(p2.x, p2.y, 2)
      );

      //window.postMessage("nativeLog", "creating line")
      let geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(50));
      let curveObject = new THREE.Line(geometry, coolmaterial);
      curveObject.visible = linesVisible;
      curveObject.curve = curve;
      scene.add(curveObject);
      horizontalLines.set(i + "," + j, curveObject);
      lines.push(curveObject);
    }
  }

  calculateHermiteSurface();
  renderer.render(scene, camera);
}

const updateCPlines = (cp) => {
  if (cp != null) {

    let i = editor.pointsMap.get(cp).i;
    let j = editor.pointsMap.get(cp).j;

    if (horizontalLines.has(i + "," + j)) {
      let curveObject = horizontalLines.get(i + "," + j)

      var p1UTanPosDirX = (cp.uTangents.posDir.x * 100 + cp.x * editor.boundingRect.width) / editor.boundingRect.width;
      var p1UTanPosDirY = (cp.uTangents.posDir.y * 100 + cp.y * editor.boundingRect.height) / editor.boundingRect.height;

      curveObject.curve.v0.set(cp.x, cp.y, 2)
      curveObject.curve.v1.set(p1UTanPosDirX, p1UTanPosDirY, 0)
      curveObject.geometry.setFromPoints(curveObject.curve.getPoints(50));
      curveObject.geometry.attributes.position.needsUpdate = true;
    }

    if (horizontalLines.has((i - 1) + "," + j)) {
      let curveObject = horizontalLines.get((i - 1) + "," + j)

      var p2UTanNegDirX = (cp.uTangents.negDir.x * -100 + cp.x * editor.boundingRect.width) / editor.boundingRect.width;
      var p2UTanNegDirY = (cp.uTangents.negDir.y * -100 + cp.y * editor.boundingRect.height) / editor.boundingRect.height;

      curveObject.curve.v2.set(p2UTanNegDirX, p2UTanNegDirY, 0)
      curveObject.curve.v3.set(cp.x, cp.y, 2)
      curveObject.geometry.setFromPoints(curveObject.curve.getPoints(50));
      curveObject.geometry.attributes.position.needsUpdate = true;
    }

    if (verticalLines.has(i + "," + j)) {
      let curveObject = verticalLines.get(i + "," + j)

      var p1VTanPosDirX = (cp.vTangents.posDir.x * 100 + cp.x * editor.boundingRect.width) / editor.boundingRect.width;
      var p1VTanPosDirY = (cp.vTangents.posDir.y * 100 + cp.y * editor.boundingRect.height) / editor.boundingRect.height;

      curveObject.curve.v0.set(cp.x, cp.y, 2)
      curveObject.curve.v1.set(p1VTanPosDirX, p1VTanPosDirY, 0)
      curveObject.geometry.setFromPoints(curveObject.curve.getPoints(50));
      curveObject.geometry.attributes.position.needsUpdate = true;
    }

    if (verticalLines.has(i + "," + (j - 1))) {
      let curveObject = verticalLines.get(i + "," + (j - 1))

      var p2VTanNegDirX = (cp.vTangents.negDir.x * -100 + cp.x * editor.boundingRect.width) / editor.boundingRect.width;
      var p2VTanNegDirY = (cp.vTangents.negDir.y * -100 + cp.y * editor.boundingRect.height) / editor.boundingRect.height;

      curveObject.curve.v2.set(p2VTanNegDirX, p2VTanNegDirY, 0)
      curveObject.curve.v3.set(cp.x, cp.y, 2)
      curveObject.geometry.setFromPoints(curveObject.curve.getPoints(50));
      curveObject.geometry.attributes.position.needsUpdate = true;
    }
  }


}



function closeWarning() {
  document.getElementById("warning").classList.add("notDisplayed");
}

function showWarning() {
  document.getElementById("warning").classList.remove("notDisplayed");
}

function acceptWarning() {
  closeWarning();
}

document.getElementById('leftTab').addEventListener("click", function () { confirmAction(changeTab, { "index": 0 }) });
document.getElementById('rightTab').addEventListener("click", function () { confirmAction(changeTab, { "index": 1 }) });

function confirmAction(action, parameters) {
  if (editor.hasChanges) {
    let actionPromise = new Promise((resolve, reject) => {
      showWarning();
      document.getElementById('btnCancelWarning').addEventListener("click", function () { reject(); });
      document.getElementById('btnAcceptWarning').addEventListener("click", function () { resolve(); });
    }).then(function (val) {
      action(parameters);
      closeWarning();
    }).catch(function (err) {
      closeWarning();
    });
  }
  else
    action(parameters);
}

function changeTab(parameters) {
  let index = parameters.index;
  switch (index) {
    case 0:
      document.getElementById("tabIndicator").style.left = "0";
      document.getElementById("collectionContent").style.display = "initial";
      document.getElementById("createYourOwnContent").style.display = "none";

      loadCollectionGradientUI();
      break;
    case 1:
      document.getElementById("tabIndicator").style.left = "50%";
      document.getElementById("collectionContent").style.display = "none";
      document.getElementById("createYourOwnContent").style.display = "initial";

      loadCustomGradientUI();
      break;
  }
}

function loadCollectionGradientUI() {
  requestChangeGradient({ "id": establishedCollectionGradientId });
}

function loadCustomGradientUI() {
  activateSizeElement(customDivisionCount)
  editor.changeDivisionCount(customDivisionCount);
  editor.initControlPoints();
  initializeHermiteSurface();
  editor.shouldRefresh = true;
}

let customColorPicker = AColorPicker.createPicker(document.getElementById('customColorPicker'), { showHSL: false, showAlpha: false });
document.getElementById('customColorPicker').style.display = "none";
let editingCustomColor = 0;
let updateCustomPicker = true;
customColorPicker.on('change', (picker, color) => {
  if (updateCustomPicker) updateCustomPickerColor(picker);
});

function updateCustomPickerColor(picker) {
  customColors[editingCustomColor] = (AColorPicker.parseColor(picker.color, "hex"));
  document.getElementById("color" + (editingCustomColor + 1) + "text").innerHTML = customColors[editingCustomColor];
  document.getElementById("color" + (editingCustomColor + 1) + "thumbnail").style.backgroundColor = customColors[editingCustomColor];
  editor.updateColors(customColors);
}

window.addEventListener("click", hidePicker);
document.getElementById('collapseLeftPanel').addEventListener("click", toggleLeftPanel);
document.getElementById('color1').addEventListener("click", function (e) { showPicker(e, 0); });
document.getElementById('color2').addEventListener("click", function (e) { showPicker(e, 1); });
document.getElementById('color3').addEventListener("click", function (e) { showPicker(e, 2); });
document.getElementById('color4').addEventListener("click", function (e) { showPicker(e, 3); });
document.getElementById('customColorPicker').addEventListener("click", stopPropagation);


function addMeshSizeListeners() {
  for (var i = 2; i < 10; i++) {
    document.getElementById('meshSize' + i).addEventListener("click", function (e) { changeMeshDivisions(e); });
  }
}

function activateSizeElement(index) {
  for (var i = 2; i < 10; i++) {
    document.getElementById('meshSize' + i).classList.remove("selected");
  }
  document.getElementById('meshSize' + index).classList.add("selected");
}

function changeMeshDivisions(e) {
  activateSizeElement(e.target.value)
  let newDivisionCount = e.target.value;
  customDivisionCount = newDivisionCount;
  editor.changeDivisionCount(newDivisionCount);
  editor.initControlPoints();
  initializeHermiteSurface();
  editor.shouldRefresh = true;
}

function initializeCustomColors() {
  for (var i = 0; i < customColors.length; i++) {
    document.getElementById("color" + (i + 1) + "text").innerHTML = customColors[i];
    document.getElementById("color" + (i + 1) + "thumbnail").style.backgroundColor = customColors[i];
  }
}

function stopPropagation(e) {
  e.stopPropagation();
}

function hidePicker() {
  document.getElementById('customColorPicker').style.display = "none";
}

function showPicker(e, colorIndex) {
  stopPropagation(e);
  updateCustomPicker = false;
  customColorPicker.color = customColors[colorIndex];
  updateCustomPicker = true;
  editingCustomColor = colorIndex;

  let fieldID = "color" + (colorIndex + 1);
  let bRect = document.getElementById(fieldID).getBoundingClientRect();
  document.getElementById('customColorPicker').style.left = bRect.x + "px";
  document.getElementById('customColorPicker').style.top = (bRect.y + bRect.height) + "px";
  document.getElementById('customColorPicker').style.display = "block";
}

let redrawInterval;

function toggleLeftPanel(e) {
  e.stopPropagation();

  if (document.getElementById("leftPanel").classList.contains("collapsed")) {
    document.getElementById("collapseLeftPanel").classList.remove("collapsed");
    document.getElementById("collapsedPanelText").classList.remove("deferredFadeIn");
    document.getElementById("collapsedPanelText").classList.add("quickFadeOut");
    document.getElementById("leftPanel").classList.remove("collapsed");
    document.getElementById("tabs").classList.remove("quickFadeOut");
    document.getElementById("tabs").classList.add("deferredFadeIn");
    document.getElementById("tabContent").classList.remove("quickFadeOut");
    document.getElementById("tabContent").classList.add("deferredFadeIn");

    document.getElementById('leftPanel').removeEventListener("click", toggleLeftPanel);
  }
  else {
    document.getElementById("collapseLeftPanel").classList.add("collapsed");
    document.getElementById("collapsedPanelText").classList.remove("quickFadeOut");
    document.getElementById("collapsedPanelText").classList.add("deferredFadeIn");
    document.getElementById("leftPanel").classList.add("collapsed");
    document.getElementById("tabs").classList.remove("deferredFadeIn");
    document.getElementById("tabs").classList.add("quickFadeOut");
    document.getElementById("tabContent").classList.remove("deferredFadeIn");
    document.getElementById("tabContent").classList.add("quickFadeOut");

    document.getElementById('leftPanel').addEventListener("click", toggleLeftPanel);
  }

  redrawInterval = setInterval(setEditorScenario, 30);
  setTimeout(function () {
    clearInterval(redrawInterval);
  }, 400);
}

