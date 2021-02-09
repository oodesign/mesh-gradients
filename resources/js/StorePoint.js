import ControlPoint from './ControlPoint';

export default class StorePoint {
  constructor(cp) {
    this.x = cp.x;
    this.y = cp.y;
    this.r = cp.r;
    this.g = cp.g;
    this.b = cp.b;
    this.a = cp.a;
    this.id = cp.id;
    this.uTanX = cp.uTangents.posDir.x;
    this.uTanY = cp.uTangents.posDir.y;
    this.vTanX = cp.vTangents.posDir.x;
    this.vTanY = cp.vTangents.posDir.y; 
  }
}
