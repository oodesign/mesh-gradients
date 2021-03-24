import ControlPoint from './ControlPoint';
import StorePoint from './StorePoint';
const AColorPicker = require('a-color-picker');
const interpolate = require('color-interpolate');

let cpIdCounter = 0;


function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    const context = this, args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export default class Editor {
  constructor(initialDivisionCount, container, colorPickerContainer, meshGradientDefinition, btnSymmetric, btnAsymmetric, controlPointEditor, customColors) {
    this.tangentFactor = 2;
    this.container = container;
    this.btnSymmetric = btnSymmetric;
    this.btnAsymmetric = btnAsymmetric;
    this.controlPointEditor = controlPointEditor;
    this.colorPickerContainer = colorPickerContainer;
    this.editing = true;
    this.divisionCount = initialDivisionCount;
    this.currentlyMovingCp = null;
    this.selectedCp = null;
    this.meshGradientDefinition = meshGradientDefinition;
    this.shouldRefresh = true;
    this.multipleSelectedCPs = [];
    this.mouseX = 0;
    this.mouseY = 0;
    this.rubberBandX = 0;
    this.rubberBandY = 0;
    this.drawingBandStarted = false;
    this.drawingBand = false;
    this.customColors = customColors;
    this.pointsMap = new Map();
    if (meshGradientDefinition == null) this.initControlPoints();
    else this.loadControlPoints(this.meshGradientDefinition);
    this.initEventListeners();
    this.boundingRect = container.getBoundingClientRect();
    this.colorEditor = AColorPicker.createPicker(this.colorPickerContainer, { showHSL: false, showAlpha: false });
    this.colorEditor.on('change', (picker, color) => {
      this.setColorToCp(AColorPicker.parseColor(picker.color, "rgba"));
    })
    this.movingCpStartPos = { x: null, y: null };
    this.handlingColorSelection = false;
    this.hasChanges = false;
  }

  initControlPoints() {

    this.resetMultipleSelection();

    this.controlPointArray = [];
    this.storePointArray = [];
    this.controlPointMatrix = new Array(this.divisionCount + 1);
    cpIdCounter = 0;

    let colormap = interpolate([this.customColors[0], this.customColors[1]]);
    let colormap2 = interpolate([this.customColors[2], this.customColors[3]]);
    let firstRowColors = [];
    let lastRowColors = [];
    for (let i = 0; i <= this.divisionCount; i++) {
      firstRowColors.push(colormap(i / this.divisionCount));
      lastRowColors.push(colormap2(i / this.divisionCount));
    }

    for (let i = 0; i <= this.divisionCount; i++) {
      this.controlPointMatrix[i] = [];

      let colormap3 = interpolate([firstRowColors[i], lastRowColors[i]]);

      for (let j = 0; j <= this.divisionCount; j++) {

        let rgb = AColorPicker.parseColor(colormap3(j / this.divisionCount), "rgb");

        const cp = {
          x: i / this.divisionCount,
          y: j / this.divisionCount,
          r: rgb[0] / 255,
          g: rgb[1] / 255,
          b: rgb[2] / 255,
          id: `control-point-${cpIdCounter++}`,
          uPosTanX: 1 / (this.divisionCount * this.tangentFactor),
          uPosTanY: 0,
          uNegTanX: 1 / (this.divisionCount * this.tangentFactor),
          uNegTanY: 0,
          vPosTanX: 0,
          vPosTanY: 1 / (this.divisionCount * this.tangentFactor),
          vNegTanX: 0,
          vNegTanY: 1 / (this.divisionCount * this.tangentFactor),
        };
        const cpObject = new ControlPoint(cp, this, i, j);
        this.pointsMap.set(cpObject, { "i": i, "j": j });
        this.container.appendChild(cpObject.cpElement);
        this.controlPointArray.push(cpObject);
        this.controlPointMatrix[i].push(cpObject);

      }
    }
    this.hasChanges = false;
  }

  loadControlPoints(meshGradientDefinition) {

    this.resetMultipleSelection();

    var parsed = JSON.parse(meshGradientDefinition);

    //window.postMessage("nativeLog", parsed);
    this.controlPointArray = [];
    this.controlPointMatrix = new Array(Math.sqrt(parsed.length));

    let index = 0;
    for (let i = 0; i <= this.divisionCount; i++) {
      this.controlPointMatrix[i] = [];
      for (let j = 0; j <= this.divisionCount; j++) {

        const cp = {
          x: parsed[index].x,
          y: parsed[index].y,
          r: parsed[index].r,
          g: parsed[index].g,
          b: parsed[index].b,
          id: parsed[index].id,
          uPosTanX: parsed[index].uPosTanX,
          uPosTanY: parsed[index].uPosTanY,
          uNegTanX: (parsed[index].uNegTanX != null) ? parsed[index].uNegTanX : parsed[index].uPosTanX,
          uNegTanY: (parsed[index].uNegTanY != null) ? parsed[index].uNegTanY : parsed[index].uPosTanY,
          vPosTanX: parsed[index].vPosTanX,
          vPosTanY: parsed[index].vPosTanY,
          vNegTanX: (parsed[index].vNegTanX != null) ? parsed[index].vNegTanX : parsed[index].vPosTanX,
          vNegTanY: (parsed[index].vNegTanY != null) ? parsed[index].vNegTanY : parsed[index].vPosTanY,
        };

        const cpObject = new ControlPoint(cp, this, i, j);
        this.pointsMap.set(cpObject, { "i": i, "j": j });
        this.container.appendChild(cpObject.cpElement);
        this.controlPointArray.push(cpObject);
        this.controlPointMatrix[i].push(cpObject);
        index++;
      }
    }
    this.hasChanges = false;
  }

  initEventListeners() {
    this.container.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.container.addEventListener('touchend', this.onTouchEnd.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('resize', debounce(() => {
      this.boundingRect = this.container.getBoundingClientRect();
    }, 500));
  }

  changeDivisionCount(newDivisionCount) {
    this.divisionCount = newDivisionCount;
    this.controlPointArray.forEach(cp => {
      this.container.removeChild(cp.cpElement);
    });
    this.pointsMap.clear();
    this.hasChanges = false;
  }

  updateColors(customColors) {
    let colormap = interpolate([customColors[0], customColors[1]]);
    let colormap2 = interpolate([customColors[2], customColors[3]]);
    let firstRowColors = [];
    let lastRowColors = [];
    for (let i = 0; i <= this.divisionCount; i++) {
      firstRowColors.push(colormap(i / this.divisionCount));
      lastRowColors.push(colormap2(i / this.divisionCount));
    }

    for (let i = 0; i <= this.divisionCount; i++) {
      let colormap3 = interpolate([firstRowColors[i], lastRowColors[i]]);
      for (let j = 0; j <= this.divisionCount; j++) {
        let rgb = AColorPicker.parseColor(colormap3(j / this.divisionCount), "rgb");
        this.controlPointMatrix[i][j].r = rgb[0] / 255;
        this.controlPointMatrix[i][j].g = rgb[1] / 255;
        this.controlPointMatrix[i][j].b = rgb[2] / 255;
      }
    }

    this.shouldRefresh = true;
    this.hasChanges = true;
  }

  getStorePointArray() {
    let storePointArray = [];
    for (var i = 0; i < this.controlPointArray.length; i++) {
      const cpStorePoint = new StorePoint(this.controlPointArray[i]);
      storePointArray.push(cpStorePoint);
    }
    return storePointArray;
  }

  onMouseUp(e) {

    if (this.currentlyMovingCp)
      this.currentlyMovingCp.cpElement.classList.remove("moving");

    this.currentlyMovingCp = null;


    if (this.currentlyMovingTangent)
      this.currentlyMovingTangent.element.classList.remove("moving");
    this.currentlyMovingTangent = null;

    this.movingCpStartPos = { x: null, y: null };
    this.shouldRefresh = false;

    if (!e.target.classList.contains('control-point')) {
      if (e.target.parentElement.classList.contains('gradient-mesh') && this.selectedCp) {
        this.selectedCp.cpElement.classList.remove('active');
        this.resetMultipleSelection()
      }
    }


    if (this.multipleSelectedCPs.length >= 1)
      this.showControlPointEditor();
    else
      this.hideControlPointEditor();


  }

  onMouseMove(e) {
    if (this.currentlyMovingCp) {
      if (!this.currentlyMovingCp.cpElement.classList.contains("moving"))
        this.currentlyMovingCp.cpElement.classList.add("moving");
      let x = (e.clientX - this.boundingRect.x) / this.boundingRect.width;
      let y = (e.clientY - this.boundingRect.y) / this.boundingRect.height;
      const deltaX = Math.abs(this.movingCpStartPos.x - x);
      const deltaY = Math.abs(this.movingCpStartPos.y - y);
      // if (e.shiftKey) {
      //   x = deltaX > deltaY ? x : this.movingCpStartPos.x;
      //   y = deltaX > deltaY ? this.movingCpStartPos.y : y;
      // }
      // if (deltaX + deltaY > 0.03 || e.ctrlKey) {
      this.currentlyMovingCp.setPosition(x, y);
      // } else {
      //   this.currentlyMovingCp.setPosition(this.movingCpStartPos.x, this.movingCpStartPos.y);
      // }
      this.hasChanges = true;
    }


    if (this.currentlyMovingTangent) {
      if (!this.currentlyMovingTangent.element.classList.contains("moving"))
        this.currentlyMovingTangent.element.classList.add("moving");
      const x = (e.clientX - this.boundingRect.x) - this.selectedCp.x * this.boundingRect.width;
      const y = (e.clientY - this.boundingRect.y) - this.selectedCp.y * this.boundingRect.height;
      this.selectedCp.moveTangent(this.currentlyMovingTangent, x, y);
      this.hasChanges = true;
    }


    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    if (!this.currentlyMovingCp && !this.currentlyMovingTangent) {

      if (this.drawingBandStarted)
        this.drawingBand = true;

      let width = this.mouseX - this.rubberBandX;
      let height = this.mouseY - this.rubberBandY;

      if (width < 0) {
        width = Math.abs(width);
        document.getElementById("rubberBand").style.left = this.rubberBandX - width + "px";
      }
      if (height < 0) {
        height = Math.abs(height);
        document.getElementById("rubberBand").style.top = this.rubberBandY - height + "px";
      }

      document.getElementById("rubberBand").style.width = width + "px";
      document.getElementById("rubberBand").style.height = height + "px";
    }

  }

  resetCPTangents() {
    if (this.editing && this.multipleSelectedCPs.length > 0) {
      this.multipleSelectedCPs.forEach(cp => {
        cp.resetTangents(this.divisionCount, this.tangentFactor);
      });
      this.hasChanges = true;
      return true;
    }
    return false;
  }

  toggleTangentBinding() {
    if (this.editing && this.selectedCp && this.currentlyMovingTangent) {
      this.currentlyMovingTangent.toggleBindTangents();
      this.hasChanges = true;
    }
  }

  onTouchEnd(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  onGeneralMouseDown(e) {
    //Draw rubber band
    this.drawingBandStarted = true;
    document.getElementById("rubberBand").classList.remove("notDisplayed");
    document.getElementById("rubberBand").style.left = this.mouseX + "px";
    document.getElementById("rubberBand").style.top = this.mouseY + "px";
    document.getElementById("rubberBand").style.width = 0;
    document.getElementById("rubberBand").style.height = 0;

    this.rubberBandX = this.mouseX;
    this.rubberBandY = this.mouseY;


  }

  checkRubberbandSelection() {
    if (this.drawingBand) {
      var leftLimit = parseFloat(document.getElementById("rubberBand").style.left.replace("px", ""));
      var rightLimit = leftLimit + parseFloat(document.getElementById("rubberBand").style.width.replace("px", ""));

      var topLimit = parseFloat(document.getElementById("rubberBand").style.top.replace("px", ""));
      var bottomLimit = topLimit + parseFloat(document.getElementById("rubberBand").style.height.replace("px", ""));

      this.resetMultipleSelection();
      let targetedPoints = this.controlPointArray.filter(cp => {
        let pointX = parseFloat((cp.x * this.boundingRect.width) + this.boundingRect.left);
        let pointY = parseFloat((cp.y * this.boundingRect.height) + this.boundingRect.top);

        return ((pointX > leftLimit) &&
          (pointX < rightLimit) &&
          (pointY > topLimit) &&
          (pointY < bottomLimit)
        )
      });
      targetedPoints.forEach(cp => { this.selectControlPoint(cp, false) });
    }
  }

  onGeneralMouseUp(e) {

    //Hide rubber band
    document.getElementById("rubberBand").classList.add("notDisplayed");

    this.checkRubberbandSelection();

    this.drawingBandStarted = false;
    this.drawingBand = false;

  }

  selectControlPoint(cp, isActiveEditing) {
    if (isActiveEditing)
      this.currentlyMovingCp = cp;

    this.shouldRefresh = true;
    this.movingCpStartPos.x = cp.x;
    this.movingCpStartPos.y = cp.y;

    this.selectedCp = cp;
    this.multipleSelectedCPs.push(cp);

    this.selectedCp.cpElement.classList.add('active');
    if (this.multipleSelectedCPs.length > 1) {
      this.controlPointArray.forEach(cp => { cp.cpElement.classList.add('noTangents'); });
    }
    else {
      this.controlPointArray.forEach(cp => { cp.cpElement.classList.remove('noTangents'); });
    }

    cp.highlight();

    this.updateTangentButtons()

    if (this.multipleSelectedCPs.length == 1) {
      this.handlingColorSelection = true;
      this.colorEditor.color = cp.getColor();
      this.handlingColorSelection = false;
    }

    if (this.multipleSelectedCPs.length >= 1)
      this.showControlPointEditor();
    else
      this.hideControlPointEditor();
  }

  onCpMouseDown(cp, e) {
    e.preventDefault();
    e.stopPropagation();

    if (!e.shiftKey)
      this.resetMultipleSelection();

    this.selectControlPoint(cp, true);


  }

  showControlPointEditor() {
    this.controlPointEditor.classList.remove("notDisplayed");
    document.getElementById("controlPointEmptyState").classList.add("notDisplayed");
  }

  hideControlPointEditor() {
    this.controlPointEditor.classList.add("notDisplayed");
    document.getElementById("controlPointEmptyState").classList.remove("notDisplayed");
  }

  updateTangentButtons(symmetric) {
    if (symmetric == null) symmetric = this.selectedCp.getSymmetricTangents();
    if (symmetric) {
      this.btnSymmetric.classList.remove("btnTertiaryRegular");
      this.btnSymmetric.classList.add("btnPrimaryRegular");
      this.btnAsymmetric.classList.remove("btnPrimaryRegular");
      this.btnAsymmetric.classList.add("btnTertiaryRegular");
    }
    else {
      this.btnSymmetric.classList.remove("btnPrimaryRegular");
      this.btnSymmetric.classList.add("btnTertiaryRegular");
      this.btnAsymmetric.classList.remove("btnTertiaryRegular");
      this.btnAsymmetric.classList.add("btnPrimaryRegular");
    }
  }

  resetMultipleSelection() {
    if (this.selectedCp) {
      this.selectedCp.cpElement.classList.remove('active');
    }
    this.multipleSelectedCPs.forEach(cp => { cp.unhighlight(); });
    this.multipleSelectedCPs = [];
    this.selectedCp = null;
    this.hideControlPointEditor();
  }


  onTangentMouseDown(tangent) {
    this.shouldRefresh = true;
    if (this.selectedCp) {
      this.currentlyMovingTangent = tangent;
    }
  }

  setColorToCp(color) {
    if (!this.handlingColorSelection) {
      this.multipleSelectedCPs.forEach(cp => { cp.setColor(color); });
      this.hasChanges = true;
    }
    this.shouldRefresh = true;
  }
}
