import SingleTangent from './SingleTangent';
const AColorPicker = require('a-color-picker');

export default class ControlPoint {
  constructor({ x, y, r, g, b, a = 1, id, uTanX = 0, uTanY = 0, vTanX = 0, vTanY = 0 }, editor) {
    this.editor = editor;
    this.x = x;
    this.y = y;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.id = id;
    this.cpElement = null;
    this.initializeDom();
    this.originalXTangentLength = uTanX;
    this.originalYTangentLength = vTanY;
    this.uTangents = {
      posDir: new SingleTangent({ x: uTanX, y: uTanY, direction: true }, this),
      negDir: new SingleTangent({ x: uTanX, y: uTanY, direction: false }, this),
    };
    this.uTangents.posDir.bindTangent(this.uTangents.negDir);
    this.vTangents = {
      posDir: new SingleTangent({ x: vTanX, y: vTanY, direction: true }, this),
      negDir: new SingleTangent({ x: vTanX, y: vTanY, direction: false }, this),
    };
    this.vTangents.posDir.bindTangent(this.vTangents.negDir);
    this.uHandlesHidden = false;
    this.vHandlesHidden = false;

    this.prevUHandleX = uTanX;
    this.prevUHandleY = uTanY;
    this.prevVHandleX = vTanX;
    this.prevVHandleY = vTanY;
  }

  initializeDom() {
    this.cpElement = document.createElement('div');
    this.cpElement.classList.add('control-point');
    // this.cpElement.setAttribute('style', `top: ${100 * this.y}%; left: ${100 * this.x}%;`);
    this.cpElement.style.left = 100 * this.x + "%";
    this.cpElement.style.top = 100 * this.y + "%";
    this.cpElement.addEventListener('mousedown', this.onCpMouseDown.bind(this));
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.cpElement) {
      // this.cpElement.setAttribute('style', `top: ${100 * y}%; left: ${100 * x}%;`);
      this.cpElement.style.left = 100 * x + "%";
      this.cpElement.style.top = 100 * y + "%";
    }
  }

  setColor(color) {
    this.r = color[0] / 255;
    this.g = color[1] / 255;
    this.b = color[2] / 255;
    this.a = color[3];
  }

  getColor() {
    return "rgba(" + (this.r * 255) + "," + (this.g * 255) + "," + (this.b * 255) + "," + this.a + ")";
  }

  moveTangent(tangent, x, y) {
    tangent.moveTangent(x, y);
  }

  resetTangents() {
    this.uTangents.posDir.setTangent(this.originalXTangentLength, 0);
    this.uTangents.negDir.setTangent(this.originalXTangentLength, 0);
    this.vTangents.posDir.setTangent(0, this.originalYTangentLength);
    this.vTangents.negDir.setTangent(0, this.originalYTangentLength);
    this.uTangents.posDir.setHidden(false);
    this.uTangents.negDir.setHidden(false);
    this.vTangents.posDir.setHidden(false);
    this.vTangents.negDir.setHidden(false);
  }

  toggleUHandles() {
    this.uHandlesHidden = !this.uHandlesHidden;
    this.uTangents.posDir.setHidden(this.uHandlesHidden);
    this.uTangents.negDir.setHidden(this.uHandlesHidden);
    if (!this.uHandlesHidden) {
      this.uTangents.posDir.setTangent(this.prevUHandleX, this.prevUHandleY);
      this.uTangents.negDir.setTangent(this.prevUHandleX, this.prevUHandleY);
    } else {
      this.prevUHandleX = this.uTangents.posDir.x;
      this.prevUHandleY = this.uTangents.posDir.y;
      this.uTangents.posDir.setTangent(0, 0);
      this.uTangents.negDir.setTangent(0, 0);
    }
  }

  toggleVHandles() {
    this.vHandlesHidden = !this.vHandlesHidden;
    this.vTangents.posDir.setHidden(this.vHandlesHidden);
    this.vTangents.negDir.setHidden(this.vHandlesHidden);
    if (!this.vHandlesHidden) {
      this.vTangents.posDir.setTangent(this.prevVHandleX, this.prevVHandleY);
      this.vTangents.negDir.setTangent(this.prevVHandleX, this.prevVHandleY);
    } else {
      this.prevVHandleX = this.vTangents.posDir.x;
      this.prevVHandleY = this.vTangents.posDir.y;
      this.vTangents.posDir.setTangent(0, 0);
      this.vTangents.negDir.setTangent(0, 0);
    }
  }

  resetUHandles() {
    this.uTangents.posDir.setTangent(this.originalXTangentLength, 0);
    this.uTangents.negDir.setTangent(this.originalXTangentLength, 0);
    this.uTangents.posDir.setHidden(false);
    this.uTangents.negDir.setHidden(false);
  }

  resetVHandles() {
    this.vTangents.posDir.setTangent(0, this.originalYTangentLength);
    this.vTangents.negDir.setTangent(0, this.originalYTangentLength);
    this.vTangents.posDir.setHidden(false);
    this.vTangents.negDir.setHidden(false);
  }

  onCpMouseDown(e) {
    if (e.target === this.cpElement) {
      this.editor.onCpMouseDown(this, e);
    }
  }

  onTangentMouseDown(tangent) {
    this.editor.onTangentMouseDown(tangent);
  }

  highlight() {
    this.cpElement.style.backgroundColor = "green";
  }

  unhighlight() {
    this.cpElement.style.backgroundColor = "black";
  }
}
