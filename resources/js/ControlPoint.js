import SingleTangent from './SingleTangent';

export default class ControlPoint {
  constructor({ x, y, r, g, b, a = 1, id, xTangentLength = 0, yTangentLength = 0 }, editor) {
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
    this.originalXTangentLength = xTangentLength;
    this.originalYTangentLength = yTangentLength;
    this.uTangents = {
      posDir: new SingleTangent({ x: xTangentLength, y: 0, direction: true }, this),
      negDir: new SingleTangent({ x: xTangentLength, y: 0, direction: false }, this),
    };
    this.uTangents.posDir.bindTangent(this.uTangents.negDir);
    this.vTangents = {
      posDir: new SingleTangent({ x: 0, y: yTangentLength, direction: true }, this),
      negDir: new SingleTangent({ x: 0, y: yTangentLength, direction: false }, this),
    };
    this.vTangents.posDir.bindTangent(this.vTangents.negDir);
    this.uHandlesHidden = false;
    this.vHandlesHidden = false;

    this.prevUHandleX = xTangentLength;
    this.prevUHandleY = yTangentLength;
    this.prevVHandleX = xTangentLength;
    this.prevVHandleY = yTangentLength;
  }

  initializeDom() {
    this.cpElement = document.createElement('div');
    this.cpElement.classList.add('control-point');
    this.cpElement.setAttribute('style', `top: ${100 * this.y}%; left: ${100 * this.x}%;`);
    this.cpElement.addEventListener('mousedown', this.onCpMouseDown.bind(this));
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.cpElement) {
      this.cpElement.setAttribute('style', `top: ${100 * y}%; left: ${100 * x}%;`);
    }
  }

  setColor({ r, g, b, a = 1 }) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
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
      console.log('cpMouseDown');
      this.editor.onCpMouseDown(this);
    }
  }

  onTangentMouseDown(tangent) {
    this.editor.onTangentMouseDown(tangent);
  }
}
