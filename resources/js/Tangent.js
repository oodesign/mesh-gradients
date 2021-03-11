const tangentClass = 'tangent-point';
const tangentDistance = 200;

export default class Tangent {
  constructor({ x = 0, y = 0, direction = true }, cp) {
    this.cp = cp;
    this.x = x;
    this.y = y;
    this.direction = direction;
    this.boundTangent = null;
    this.initializeDom();
  }

  toScreenSpace(value) {
    return value * tangentDistance * (this.direction ? -1 : 1);
  }

  initializeDom() {
    this.element = document.createElement('div');
    this.element.classList.add(tangentClass);
    this.element.style.transform = `translate(${this.toScreenSpace(this.x)}px, ${this.toScreenSpace(this.y)}px)`;
    this.element.addEventListener('mousedown', () => this.onTangentMouseDown(this));
    this.cp.cpElement.appendChild(this.element);
  }

  setTangent(x, y) {
    this.x = x;
    this.y = y;
    this.reallocate();
  }

  reallocate() {
    if (this.element) {
      this.element.style.transform = `translate(${this.toScreenSpace(this.x)}px, ${this.toScreenSpace(this.y)}px)`;
    }
  }

  moveTangent(x, y) {
    const newX = x / tangentDistance * (this.direction ? -1 : 1);
    const newY = y / tangentDistance * (this.direction ? -1 : 1);
    this.setTangent(newX, newY);
    if (this.boundTangent) {
      this.boundTangent.setTangent(newX, newY);
    }
  }

  onTangentMouseDown(tangent) {
    this.cp.onTangentMouseDown(tangent);
  }

  initializeTangentPair(tangent) {
    this.tangentPair = tangent;
    tangent.tangentPair = this;
  }

  bindTangent(tangent) {
    this.tangentPair = tangent;
    this.boundTangent = tangent;
    tangent.tangentPair = this;
    tangent.boundTangent = this;
  }

  toggleBindTangents() {
    if (this.tangentPair) {
      if (this.boundTangent) {
        this.boundTangent.boundTangent = null;
        this.boundTangent = null;
      } else {
        this.boundTangent = this.tangentPair;
        this.tangentPair.boundTangent = this;
        this.tangentPair.moveTangent(this.x * tangentDistance, this.y * tangentDistance);
      }
    } else {
      console.warn('no tangentPair set for tangent');
    }

  }

  setHidden(hidden) {
    if (hidden) {
      this.element.classList.add('hidden');
    } else {
      this.element.classList.remove('hidden');
    }
  }
}
