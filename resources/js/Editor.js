import ControlPoint from './ControlPoint';
import StorePoint from './StorePoint';
const AColorPicker = require('a-color-picker');

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
  constructor(initialDivisionCount, container, colorPickerContainer, meshGradientDefinition) {
    this.container = container;
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
    this.pointsMap = new Map();
    if (meshGradientDefinition == null) this.initControlPoints();
    else this.loadControlPoints();
    this.initEventListeners();
    this.boundingRect = container.getBoundingClientRect();
    this.colorEditor = AColorPicker.createPicker(this.colorPickerContainer, { showHSL: false, showAlpha: false });
    this.colorEditor.on('change', (picker, color) => {
      this.setColorToCp(AColorPicker.parseColor(picker.color, "rgba"));
    })
    this.movingCpStartPos = { x: null, y: null };
  }

  initControlPoints() {
    this.controlPointArray = [];
    this.storePointArray = [];
    this.controlPointMatrix = new Array(this.divisionCount + 1);
    cpIdCounter = 0;

    for (let i = 0; i <= this.divisionCount; i++) {
      this.controlPointMatrix[i] = [];
      for (let j = 0; j <= this.divisionCount; j++) {
        const cp = {
          x: i / this.divisionCount,
          y: j / this.divisionCount,
          r: i / this.divisionCount,
          g: j / this.divisionCount,
          b: j / this.divisionCount,
          id: `control-point-${cpIdCounter++}`,
          uTanX: 1 / this.divisionCount,
          uTanY: 0,
          vTanX: 0,
          vTanY: 1 / this.divisionCount,
        };
        const cpObject = new ControlPoint(cp, this);
        this.pointsMap.set(cpObject, { "i": i, "j": j });
        this.container.appendChild(cpObject.cpElement);
        this.controlPointArray.push(cpObject);
        this.controlPointMatrix[i].push(cpObject);

      }
    }
  }

  loadControlPoints() {
    var parsed = JSON.parse(this.meshGradientDefinition);
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
          uTanX: parsed[index].uTanX,
          uTanY: parsed[index].uTanY,
          vTanX: parsed[index].vTanX,
          vTanY: parsed[index].vTanY,
        };
        const cpObject = new ControlPoint(cp, this, i, j);
        this.pointsMap.set(cpObject, { "i": i, "j": j });
        this.container.appendChild(cpObject.cpElement);
        this.controlPointArray.push(cpObject);
        this.controlPointMatrix[i].push(cpObject);
        index++;
      }
    }
  }

  initEventListeners() {
    this.container.addEventListener('click', this.onClick.bind(this));
    this.container.addEventListener('mouseup', this.onMouseUp.bind(this));
    this.container.addEventListener('touchend', this.onTouchEnd.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('resize', debounce(() => {
      this.boundingRect = this.container.getBoundingClientRect();
    }, 500));
  }

  getStorePointArray() {
    let storePointArray = [];
    for (var i = 0; i < this.controlPointArray.length; i++) {
      const cpStorePoint = new StorePoint(this.controlPointArray[i]);
      storePointArray.push(cpStorePoint);
    }
    return storePointArray;
  }

  onClick(e) {
    if (e.target === this.container) {
      // if (this.editing) {
      // this.editing = false;
      //this.container.classList.remove('editing');
      //this.colorEditor.wrapper.classList.remove('editing');
      // } else {
      // this.editing = true;
      //this.container.classList.add('editing');
      //this.colorEditor.wrapper.classList.add('editing');
      // }
    }
  }

  onMouseUp(e) {
    this.currentlyMovingCp = null;
    this.currentlyMovingTangent = null;
    this.movingCpStartPos = { x: null, y: null };
    this.shouldRefresh = false;

    if (!e.target.classList.contains('control-point')) {
      if (e.target.parentElement.classList.contains('gradient-mesh') && this.selectedCp) {
        this.selectedCp.cpElement.classList.remove('active');
        this.resetMultipleSelection()
        this.selectedCp = null;
      }
    }
  }

  onMouseMove(e) {
    if (this.currentlyMovingCp) {
      let x = (e.clientX - this.boundingRect.x) / this.boundingRect.width;
      let y = (e.clientY - this.boundingRect.y) / this.boundingRect.height;
      const deltaX = Math.abs(this.movingCpStartPos.x - x);
      const deltaY = Math.abs(this.movingCpStartPos.y - y);
      if (e.shiftKey) {
        x = deltaX > deltaY ? x : this.movingCpStartPos.x;
        y = deltaX > deltaY ? this.movingCpStartPos.y : y;
      }
      if (deltaX + deltaY > 0.03 || e.ctrlKey) {
        this.currentlyMovingCp.setPosition(x, y);
      } else {
        this.currentlyMovingCp.setPosition(this.movingCpStartPos.x, this.movingCpStartPos.y);
      }
    }
    if (this.currentlyMovingTangent) {
      const x = (e.clientX - this.boundingRect.x) - this.selectedCp.x * this.boundingRect.width;
      const y = (e.clientY - this.boundingRect.y) - this.selectedCp.y * this.boundingRect.height;
      this.selectedCp.moveTangent(this.currentlyMovingTangent, x, y);
    }

    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

  }

  resetSelectedCpTangent() {
    if (this.editing && this.selectedCp) {
      this.selectedCp.resetTangents();
      return true;
    }
    return false;
  }

  toggleCpXHandles() {
    if (this.editing && this.selectedCp) {
      this.selectedCp.toggleUHandles();
    }
  }

  toggleCpYHandles() {
    if (this.editing && this.selectedCp) {
      this.selectedCp.toggleVHandles();
    }
  }

  resetCpXHandles() {
    if (this.editing && this.selectedCp) {
      this.selectedCp.resetUHandles();
    }
  }

  resetCpYHandles() {
    if (this.editing && this.selectedCp) {
      this.selectedCp.resetVHandles();
    }
  }

  toggleTangentBinding() {
    if (this.editing && this.selectedCp && this.currentlyMovingTangent) {
      this.currentlyMovingTangent.toggleBindTangents();
    }
  }

  onTouchEnd(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  onCpMouseDown(cp, e) {

    //window.postMessage("nativeLog", "CP position and tangents: (" + cp.x + "," + cp.y + ") - UTAN:posDir(" + cp.uTangents.posDir.x + "," + cp.uTangents.posDir.y + ") - negDir(" + cp.uTangents.negDir.x + "," + cp.uTangents.negDir.y + ") - VTAN:posDir(" + cp.vTangents.posDir.x + "," + cp.vTangents.posDir.y + ") - negDir(" + cp.vTangents.negDir.x + "," + cp.vTangents.negDir.y + ")");

    this.currentlyMovingCp = cp;
    this.shouldRefresh = true;
    this.movingCpStartPos.x = cp.x;
    this.movingCpStartPos.y = cp.y;
    if (this.selectedCp) {
      this.selectedCp.cpElement.classList.remove('active');
    }
    this.selectedCp = cp;
    this.selectedCp.cpElement.classList.add('active');

    if (!e.shiftKey)
      this.resetMultipleSelection();

    this.multipleSelectedCPs.push(cp);
    cp.highlight();

    if (this.multipleSelectedCPs.length == 1)
      this.colorEditor.color = cp.getColor();

  }

  resetMultipleSelection() {
    this.multipleSelectedCPs.forEach(cp => { cp.unhighlight(); });
    this.multipleSelectedCPs = [];
  }


  onTangentMouseDown(tangent) {
    this.shouldRefresh = true;
    if (this.selectedCp) {
      this.currentlyMovingTangent = tangent;
    }
  }

  setColorToCp(color) {
    this.multipleSelectedCPs.forEach(cp => { cp.setColor(color); });
    this.shouldRefresh = true;
  }


}
