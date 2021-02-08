import ControlPoint from './ControlPoint';
import ColorEditor from './ColorEditor';

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
  constructor(initialDivisionCount, container, meshGradientDefinition) {
    this.container = container;
    this.editing = false;
    this.divisionCount = initialDivisionCount;
    this.currentlyMovingCp = null;
    this.selectedCp = null;
    this.meshGradientDefinition = meshGradientDefinition;
    this.shouldRefresh = true;
    if (meshGradientDefinition == null) this.initControlPoints();
    else this.loadControlPoints();
    this.initEventListeners();
    this.boundingRect = container.getBoundingClientRect();
    this.colorEditor = new ColorEditor(document.querySelector('.colorpicker'), this.setColor.bind(this));
    this.movingCpStartPos = { x: null, y: null };
  }

  initControlPoints() {
    this.controlPointArray = [];
    this.controlPointMatrix = new Array(this.divisionCount + 1);
    //cpIdCounter = 0;

    for (let i = 0; i <= this.divisionCount; i++) {
      this.controlPointMatrix[i] = [];
      for (let j = 0; j <= this.divisionCount; j++) {
        const cp = {
          x: i / this.divisionCount,
          y: j / this.divisionCount,
          // r: (i == 0) ? 1 : 0,
          // g: (i == 1) ? 1 : 0,
          // b: (i == 2) ? 1 : 0,
          r: i / this.divisionCount,
          g: j / this.divisionCount,
          b: j / this.divisionCount,
          id: `control-point-${cpIdCounter++}`,
          // xTangentLength: 1 / 2,
          // yTangentLength: 1 / 2,
          xTangentLength: 1 / this.divisionCount,
          yTangentLength: 1 / this.divisionCount,
        };
        const cpObject = new ControlPoint(cp, this);
        this.container.appendChild(cpObject.cpElement);
        this.controlPointArray.push(cpObject);
        this.controlPointMatrix[i].push(cpObject);
      }
    }
  }

  loadControlPoints() {


    window.postMessage("nativeLog", "loadControlPoints");
    window.postMessage("nativeLog", "LOAD CONTROL POINTS RECEIVES: " + this.meshGradientDefinition);

    this.controlPointArray = [];
    this.controlPointMatrix = new Array(this.divisionCount + 1);
    //cpIdCounter = 0;
    //this.container.innerHTML="";

    var parsed = JSON.parse(this.meshGradientDefinition);
    var result = [];
    for (var i = 0; i < parsed.length; i++) {
      var points = {
        "x": parsed[i].x,
        "y": parsed[i].y,
        "r": parsed[i].r,
        "g": parsed[i].g,
        "b": parsed[i].b,
      }
      result.push(points);
    }


    window.postMessage("nativeLog", "Recovered Array:")
    window.postMessage("nativeLog", result)



    for (let i = 0; i <= this.divisionCount; i++) {
      this.controlPointMatrix[i] = [];
      for (let j = 0; j <= this.divisionCount; j++) {

    window.postMessage("nativeLog", "Adding point to {"+points.x[i][j]+","+points.y[i][j]+"}, with RGB:{"+points.r[i][j]+","+points.g[i][j]+","+points.b[i][j]+"}")
        const cp = {
          x: points.x[j][i],
          y: points.y[j][i],
          r: points.r[j][i],
          g: points.g[j][i],
          b: points.b[j][i],
          id: `control-point-${cpIdCounter++}`,
          xTangentLength: 1 / this.divisionCount,
          yTangentLength: 1 / this.divisionCount,
        };
        const cpObject = new ControlPoint(cp, this);
        this.container.appendChild(cpObject.cpElement);
        this.controlPointArray.push(cpObject);
        this.controlPointMatrix[i].push(cpObject);
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

  onClick(e) {
    if (e.target === this.container) {
      if (this.editing) {
        this.editing = false;
        this.container.classList.remove('editing');
        this.colorEditor.wrapper.classList.remove('editing');
      } else {
        this.editing = true;
        this.container.classList.add('editing');
        this.colorEditor.wrapper.classList.add('editing');
      }
    }
  }

  onMouseUp(e) {
    this.currentlyMovingCp = null;
    this.currentlyMovingTangent = null;
    this.movingCpStartPos = { x: null, y: null };
    this.shouldRefresh = false;
    if (e.target.classList.contains('gradient-mesh') && this.selectedCp) {
      this.selectedCp.cpElement.classList.remove('active');
      this.selectedCp = null;
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

  onCpMouseDown(cp) {
    this.currentlyMovingCp = cp;
    this.shouldRefresh = true;
    this.movingCpStartPos.x = cp.x;
    this.movingCpStartPos.y = cp.y;
    if (this.selectedCp) {
      this.selectedCp.cpElement.classList.remove('active');
    }
    this.selectedCp = cp;
    this.selectedCp.cpElement.classList.add('active');
    this.colorEditor.setColor(cp);
    console.log('SET CP_UNDER_EDITING', this.currentlyMovingCp.id);
  }

  onTangentMouseDown(tangent) {
    this.shouldRefresh = true;
    if (this.selectedCp) {
      this.currentlyMovingTangent = tangent;
    }
  }

  setColor(color) {
    if (this.selectedCp) {
      this.selectedCp.setColor(color);
    }
  }
}
