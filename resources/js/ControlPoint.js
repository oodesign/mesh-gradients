import SingleTangent from './SingleTangent';
const AColorPicker = require('a-color-picker');

export default class ControlPoint {
  constructor({ x, y, r, g, b, a = 1, id, uPosTanX = 0, uPosTanY = 0, uNegTanX = 0, uNegTanY = 0, vPosTanX = 0, vPosTanY = 0, vNegTanX = 0, vNegTanY = 0 }, editor) {
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
    this.originalPosXTangentLength = uPosTanX;
    this.originalNegXTangentLength = uNegTanX;
    this.originalPosYTangentLength = vPosTanY;
    this.originalNegYTangentLength = vNegTanY;
    this.uTangents = {
      posDir: new SingleTangent({ x: uPosTanX, y: uPosTanY, direction: true }, this),
      negDir: new SingleTangent({ x: uNegTanX, y: uNegTanY, direction: false }, this),
    };

    if ((uPosTanX == uNegTanX) && (uPosTanY == uNegTanY))
      this.uTangents.posDir.bindTangent(this.uTangents.negDir);
    else
      this.uTangents.posDir.initializeTangentPair(this.uTangents.negDir);

    this.vTangents = {
      posDir: new SingleTangent({ x: vPosTanX, y: vPosTanY, direction: true }, this),
      negDir: new SingleTangent({ x: vNegTanX, y: vNegTanY, direction: false }, this),
    };

    if ((vPosTanX == vNegTanX) && (vPosTanY == vNegTanY))
      this.vTangents.posDir.bindTangent(this.vTangents.negDir);
    else
      this.vTangents.posDir.initializeTangentPair(this.vTangents.negDir);

    this.uHandlesHidden = false;
    this.vHandlesHidden = false;

    this.prevUHandlePosX = uPosTanX;
    this.prevUHandlePosY = uPosTanY;
    this.prevUHandleNegX = uNegTanX;
    this.prevUHandleNegY = uNegTanY;
    this.prevVHandlePosX = vPosTanX;
    this.prevVHandlePosY = vPosTanY;
    this.prevVHandleNegX = vNegTanX;
    this.prevVHandleNegY = vNegTanY;
  }

  initializeDom() {
    this.cpElement = document.createElement('div');
    this.cpElement.classList.add('control-point');
    this.cpElement.style.left = 100 * this.x + "%";
    this.cpElement.style.top = 100 * this.y + "%";
    this.cpElement.addEventListener('mousedown', this.onCpMouseDown.bind(this));
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.cpElement) {
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
    this.uTangents.posDir.setTangent(this.originalPosXTangentLength, 0);
    this.uTangents.negDir.setTangent(this.originalNegXTangentLength, 0);
    this.vTangents.posDir.setTangent(0, this.originalPosYTangentLength);
    this.vTangents.negDir.setTangent(0, this.originalNegYTangentLength);
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
      this.uTangents.posDir.setTangent(this.prevUHandlePosX, this.prevUHandlePosY);
      this.uTangents.negDir.setTangent(this.prevUHandleNegX, this.prevUHandleNegY);
    } else {
      this.prevUHandlePosX = this.uTangents.posDir.x;
      this.prevUHandleNegX = this.uTangents.negDir.x;
      this.prevUHandlePosY = this.uTangents.posDir.y;
      this.prevUHandleNegY = this.uTangents.negDir.y;
      this.uTangents.posDir.setTangent(0, 0);
      this.uTangents.negDir.setTangent(0, 0);
    }
  }

  toggleVHandles() {
    this.vHandlesHidden = !this.vHandlesHidden;
    this.vTangents.posDir.setHidden(this.vHandlesHidden);
    this.vTangents.negDir.setHidden(this.vHandlesHidden);
    if (!this.vHandlesHidden) {
      this.vTangents.posDir.setTangent(this.prevVHandlePosX, this.prevVHandlePosY);
      this.vTangents.negDir.setTangent(this.prevVHandleNegX, this.prevVHandleNegY);
    } else {
      this.prevVHandlePosX = this.vTangents.posDir.x;
      this.prevVHandleNegX = this.vTangents.negDir.x;
      this.prevVHandlePosY = this.vTangents.posDir.y;
      this.prevVHandleNegY = this.vTangents.negDir.y;
      this.vTangents.posDir.setTangent(0, 0);
      this.vTangents.negDir.setTangent(0, 0);
    }
  }

  resetUHandles() {
    this.uTangents.posDir.setTangent(this.originalPosXTangentLength, 0);
    this.uTangents.negDir.setTangent(this.originalNegXTangentLength, 0);
    this.uTangents.posDir.setHidden(false);
    this.uTangents.negDir.setHidden(false);
  }

  resetVHandles() {
    this.vTangents.posDir.setTangent(0, this.originalPosYTangentLength);
    this.vTangents.negDir.setTangent(0, this.originalNegYTangentLength);
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
    this.cpElement.classList.add('highlighted');
  }

  unhighlight() {
    this.cpElement.classList.remove('highlighted');
  }
}
