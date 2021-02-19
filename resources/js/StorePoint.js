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
    this.uPosTanX = cp.uTangents.posDir.x;
    this.uNegTanX = cp.uTangents.negDir.x;
    this.uPosTanY = cp.uTangents.posDir.y;
    this.uNegTanY = cp.uTangents.negDir.y;
    this.vPosTanX = cp.vTangents.posDir.x;
    this.vNegTanX = cp.vTangents.negDir.x;
    this.vPosTanY = cp.vTangents.posDir.y; 
    this.vNegTanY = cp.vTangents.negDir.y; 
  }
}
