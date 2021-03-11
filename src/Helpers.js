var fs = require('@skpm/fs');
var track = require("sketch-module-google-analytics");
var Settings = require('sketch/settings')

var acquiredLicense = "Single";
var logsEnabled = false;

export const commands = {
  editgradient: 'editgradient',
}

export const valStatus = {
  app: 'app',
  no: 'no',
  over: 'over',
  noCon: 'nocon'
}

const gradientCollection = [
  {
    "id": 1,
    "order": 1,
    "thumbnail": "thumbnail001.png",
    "meshGradientDefinition": `[{"x":0,"y":0,"r":0.7529411764705882,"g":0.9098039215686274,"b":0.9921568627450981,"a":1,"id":"control-point-0","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0,"y":0.16666666666666666,"r":0.8156862745098039,"g":0.9098039215686274,"b":0.9372549019607843,"a":1,"id":"control-point-1","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0,"y":0.3333333333333333,"r":0.8823529411764706,"g":0.9176470588235294,"b":0.8745098039215686,"a":1,"id":"control-point-2","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0,"y":0.5,"r":0.9921568627450981,"g":0.9411764705882353,"b":0.7215686274509804,"a":1,"id":"control-point-3","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0,"y":0.6666666666666666,"r":0.9921568627450981,"g":0.9411764705882353,"b":0.7215686274509804,"a":1,"id":"control-point-4","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0,"y":0.8333333333333334,"r":0.9882352941176471,"g":0.9254901960784314,"b":0.7372549019607844,"a":1,"id":"control-point-5","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0,"y":1,"r":1,"g":0.9411764705882353,"b":0.7803921568627451,"a":1,"id":"control-point-6","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.16666666666666666,"y":0,"r":0.7686274509803922,"g":0.9215686274509803,"b":0.996078431372549,"a":1,"id":"control-point-7","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.16726681379951214,"y":0.14372555852402524,"r":0.7490196078431373,"g":0.9019607843137255,"b":0.9764705882352941,"a":1,"id":"control-point-8","uPosTanX":0.12,"uNegTanX":0.12,"uPosTanY":-0.04,"uNegTanY":-0.04,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.14000851821736943,"y":0.3791381112788942,"r":0.8235294117647058,"g":0.8784313725490196,"b":0.9254901960784314,"a":1,"id":"control-point-9","uPosTanX":0.275,"uNegTanX":0.275,"uPosTanY":-0.03,"uNegTanY":-0.03,"vPosTanX":0.005,"vNegTanX":0.005,"vPosTanY":0.14,"vNegTanY":0.14},{"x":0.13015873015873017,"y":0.6677248677248677,"r":1,"g":0.9058823529411765,"b":0.7176470588235294,"a":1,"id":"control-point-10","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.1439153439153439,"y":0.7777777777777778,"r":1,"g":0.9176470588235294,"b":0.7176470588235294,"a":1,"id":"control-point-11","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.15132275132275133,"y":0.873015873015873,"r":0.996078431372549,"g":0.9921568627450981,"b":0.7764705882352941,"a":1,"id":"control-point-12","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.16666666666666666,"y":1,"r":1,"g":0.9411764705882353,"b":0.7803921568627451,"a":1,"id":"control-point-13","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.37566137566137564,"y":0,"r":0.7686274509803922,"g":0.9215686274509803,"b":0.996078431372549,"a":1,"id":"control-point-14","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.30158730158730157,"y":0.19365079365079366,"r":0.6941176470588235,"g":0.8,"b":0.9686274509803922,"a":1,"id":"control-point-15","uPosTanX":0.09,"uNegTanX":0.09,"uPosTanY":0.02,"uNegTanY":0.02,"vPosTanX":-0.12,"vNegTanX":-0.12,"vPosTanY":0.34,"vNegTanY":0.34},{"x":0.2931216931216931,"y":0.37037037037037035,"r":0.9176470588235294,"g":0.45098039215686275,"b":0.7490196078431373,"a":1,"id":"control-point-16","uPosTanX":0.07,"uNegTanX":0.07,"uPosTanY":0,"uNegTanY":0,"vPosTanX":-0.14,"vNegTanX":-0.14,"vPosTanY":0.18,"vNegTanY":0.18},{"x":0.29523809523809524,"y":0.5492063492063493,"r":0.9921568627450981,"g":0.8352941176470589,"b":0.6196078431372549,"a":1,"id":"control-point-17","uPosTanX":0.05,"uNegTanX":0.05,"uPosTanY":0.02,"uNegTanY":0.02,"vPosTanX":0.02,"vNegTanX":0.02,"vPosTanY":0.23,"vNegTanY":0.23},{"x":0.361791923181167,"y":0.7273008866689898,"r":1,"g":0.9176470588235294,"b":0.7137254901960784,"a":1,"id":"control-point-18","uPosTanX":0.24772916666666675,"uNegTanX":0.24772916666666675,"uPosTanY":-0.09315476190476261,"uNegTanY":-0.09315476190476261,"vPosTanX":0.037729166666666744,"vNegTanX":0.037729166666666744,"vPosTanY":0.2468452380952374,"vNegTanY":0.2468452380952374},{"x":0.3333333333333333,"y":0.8761904761904762,"r":0.996078431372549,"g":0.9921568627450981,"b":0.7764705882352941,"a":1,"id":"control-point-19","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.3333333333333333,"y":1,"r":1,"g":0.9921568627450981,"b":0.796078431372549,"a":1,"id":"control-point-20","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.5,"y":0,"r":0.6588235294117647,"g":0.792156862745098,"b":0.9764705882352941,"a":1,"id":"control-point-21","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.5058201058201058,"y":0.10687830687830688,"r":0.6,"g":0.6745098039215687,"b":0.9529411764705882,"a":1,"id":"control-point-22","uPosTanX":0.07,"uNegTanX":0.07,"uPosTanY":-0.02,"uNegTanY":-0.02,"vPosTanX":0.01999999999999943,"vNegTanX":0.01999999999999943,"vPosTanY":0.22,"vNegTanY":0.22},{"x":0.4931216931216931,"y":0.2804232804232804,"r":0.6509803921568628,"g":0.4235294117647059,"b":0.8627450980392157,"a":1,"id":"control-point-23","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0.00004563492063482499,"vNegTanX":0.00004563492063482499,"vPosTanY":0.1867212301587304,"vNegTanY":0.1867212301587304},{"x":0.4793650793650794,"y":0.43174603174603177,"r":0.9019607843137255,"g":0.43529411764705883,"b":0.6745098039215687,"a":1,"id":"control-point-24","uPosTanX":0.17,"uNegTanX":0.17,"uPosTanY":0.06,"uNegTanY":0.06,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.11,"vNegTanY":0.11},{"x":0.5735449735449736,"y":0.7142857142857143,"r":1,"g":0.8980392156862745,"b":0.6823529411764706,"a":1,"id":"control-point-25","uPosTanX":0.07,"uNegTanX":0.07,"uPosTanY":0.04,"uNegTanY":0.04,"vPosTanX":0.02,"vNegTanX":0.02,"vPosTanY":0.27,"vNegTanY":0.27},{"x":0.49523809523809526,"y":0.8761904761904762,"r":0.996078431372549,"g":0.9921568627450981,"b":0.7803921568627451,"a":1,"id":"control-point-26","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.5,"y":1,"r":1,"g":0.9333333333333333,"b":0.7098039215686275,"a":1,"id":"control-point-27","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.7979246524954505,"y":0.0012390134355519417,"r":0.5254901960784314,"g":0.6509803921568628,"b":0.9450980392156862,"a":1,"id":"control-point-28","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.7375661375661375,"y":0.08677248677248678,"r":0.5529411764705883,"g":0.6705882352941176,"b":0.9450980392156862,"a":1,"id":"control-point-29","uPosTanX":0.22,"uNegTanX":0.22,"uPosTanY":-0.08,"uNegTanY":-0.08,"vPosTanX":-0.07,"vNegTanX":-0.07,"vPosTanY":0.07,"vNegTanY":0.07},{"x":0.7005291005291006,"y":0.273015873015873,"r":0.5294117647058824,"g":0.32941176470588235,"b":0.8705882352941177,"a":1,"id":"control-point-30","uPosTanX":0.176073412698413,"uNegTanX":0.176073412698413,"uPosTanY":0.016505952380952635,"uNegTanY":0.016505952380952635,"vPosTanX":0.01,"vNegTanX":0.01,"vPosTanY":0.4,"vNegTanY":0.4},{"x":0.6645502645502646,"y":0.45185185185185184,"r":0.9450980392156862,"g":0.4627450980392157,"b":0.5411764705882353,"a":1,"id":"control-point-31","uPosTanX":0.3135436507936504,"uNegTanX":0.3135436507936504,"uPosTanY":0.07686805555555566,"uNegTanY":0.07686805555555566,"vPosTanX":0.03354365079365038,"vNegTanX":0.03354365079365038,"vPosTanY":0.17686805555555565,"vNegTanY":0.17686805555555565},{"x":0.7037037037037037,"y":0.7523809523809524,"r":1,"g":0.8980392156862745,"b":0.6862745098039216,"a":1,"id":"control-point-32","uPosTanX":0.14,"uNegTanX":0.14,"uPosTanY":0.16,"uNegTanY":0.16,"vPosTanX":0.02,"vNegTanX":0.02,"vPosTanY":0.22,"vNegTanY":0.22},{"x":0.6814814814814815,"y":0.9375661375661376,"r":0.996078431372549,"g":0.8705882352941177,"b":0.6235294117647059,"a":1,"id":"control-point-33","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.6666666666666666,"y":1,"r":0.996078431372549,"g":0.8980392156862745,"b":0.6509803921568628,"a":1,"id":"control-point-34","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.9193479691795408,"y":0,"r":0.396078431372549,"g":0.5098039215686274,"b":0.9215686274509803,"a":1,"id":"control-point-35","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0.01,"vNegTanX":0.01,"vPosTanY":0.14,"vNegTanY":0.14},{"x":0.9111111111111111,"y":0.08677248677248678,"r":0.30980392156862746,"g":0.25882352941176473,"b":0.8901960784313725,"a":1,"id":"control-point-36","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":-0.006479166666666742,"vNegTanX":-0.006479166666666742,"vPosTanY":0.10033531746031756,"vNegTanY":0.10033531746031756},{"x":0.8984126984126984,"y":0.32063492063492066,"r":0.39215686274509803,"g":0.27450980392156865,"b":0.8823529411764706,"a":1,"id":"control-point-37","uPosTanX":0.14896726190476214,"uNegTanX":0.14896726190476214,"uPosTanY":0.07217559523809484,"uNegTanY":0.07217559523809484,"vPosTanX":0.04,"vNegTanX":0.04,"vPosTanY":0.52,"vNegTanY":0.52},{"x":0.8759824989352228,"y":0.5141905757540558,"r":0.8745098039215686,"g":0.37254901960784315,"b":0.3411764705882353,"a":1,"id":"control-point-38","uPosTanX":0.24,"uNegTanX":0.24,"uPosTanY":0.09,"uNegTanY":0.09,"vPosTanX":0.1,"vNegTanX":0.1,"vPosTanY":0.19,"vNegTanY":0.19},{"x":0.8761904761904762,"y":0.8148148148148148,"r":0.9921568627450981,"g":0.8352941176470589,"b":0.6235294117647059,"a":1,"id":"control-point-39","uPosTanX":0.19,"uNegTanX":0.19,"uPosTanY":0.03,"uNegTanY":0.03,"vPosTanX":0.05,"vNegTanX":0.05,"vPosTanY":0.35,"vNegTanY":0.35},{"x":0.8858946064196384,"y":0.9280210632284044,"r":0.996078431372549,"g":0.8705882352941177,"b":0.6196078431372549,"a":1,"id":"control-point-40","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":0.8772215123707747,"y":0.999883842490417,"r":0.9921568627450981,"g":0.8392156862745098,"b":0.5725490196078431,"a":1,"id":"control-point-41","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":1.0482053664769426,"y":0.0024780268711038834,"r":0.2196078431372549,"g":0.32941176470588235,"b":0.8901960784313725,"a":1,"id":"control-point-42","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":1.0159910171525923,"y":0.11522824950633058,"r":0.21176470588235294,"g":0.19607843137254902,"b":0.8901960784313725,"a":1,"id":"control-point-43","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":1.0444444444444445,"y":0.37671957671957673,"r":0.2,"g":0.19215686274509805,"b":0.8745098039215686,"a":1,"id":"control-point-44","uPosTanX":0.09,"uNegTanX":0.09,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0.030000000000001137,"vNegTanX":0.030000000000001137,"vPosTanY":0.52,"vNegTanY":0.52},{"x":1.1576719576719576,"y":0.6486772486772486,"r":0.8745098039215686,"g":0.37254901960784315,"b":0.3411764705882353,"a":1,"id":"control-point-45","uPosTanX":0.4500000000000011,"uNegTanX":0.4500000000000011,"uPosTanY":0.12,"uNegTanY":0.12,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666},{"x":1.0645502645502645,"y":0.782010582010582,"r":0.8745098039215686,"g":0.37254901960784315,"b":0.33725490196078434,"a":1,"id":"control-point-46","uPosTanX":0.07,"uNegTanX":0.07,"uPosTanY":0.01,"uNegTanY":0.01,"vPosTanX":0.01,"vNegTanX":0.01,"vPosTanY":0.06,"vNegTanY":0.06},{"x":1.0835978835978837,"y":0.9343915343915344,"r":0.8745098039215686,"g":0.45098039215686275,"b":0.34509803921568627,"a":1,"id":"control-point-47","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0.03,"vNegTanX":0.03,"vPosTanY":0.1,"vNegTanY":0.1},{"x":1,"y":1,"r":0.996078431372549,"g":0.7490196078431373,"b":0.4627450980392157,"a":1,"id":"control-point-48","uPosTanX":0.16666666666666666,"uNegTanX":0.16666666666666666,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.16666666666666666,"vNegTanY":0.16666666666666666}]`
  },
  {
    "id": 2,
    "order": 2,
    "thumbnail": "thumbnail002.png",
    "meshGradientDefinition": `[{"x":0,"y":0,"r":1,"g":1,"b":1,"a":1,"id":"control-point-0","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0,"y":0.2,"r":0.8,"g":1,"b":0.9254901960784314,"a":1,"id":"control-point-1","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0,"y":0.4,"r":0.6,"g":1,"b":0.8549019607843137,"a":1,"id":"control-point-2","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0,"y":0.6,"r":0.4,"g":1,"b":0.7803921568627451,"a":1,"id":"control-point-3","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0,"y":0.8,"r":0.2,"g":1,"b":0.7098039215686275,"a":1,"id":"control-point-4","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0,"y":1,"r":0,"g":1,"b":0.6352941176470588,"a":1,"id":"control-point-5","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.2,"y":0,"r":1,"g":1,"b":1,"a":1,"id":"control-point-6","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.2,"y":0.2,"r":0.8392156862745098,"g":1,"b":0.9411764705882353,"a":1,"id":"control-point-7","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.16149732620320856,"y":0.3181818181818182,"r":0.6784313725490196,"g":1,"b":0.8823529411764706,"a":1,"id":"control-point-8","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.3122994652406417,"y":0.5064171122994653,"r":0.3215686274509804,"g":0.7490196078431373,"b":0.5882352941176471,"a":1,"id":"control-point-9","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.2,"y":0.8,"r":0.3607843137254902,"g":1,"b":0.7686274509803922,"a":1,"id":"control-point-10","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.2,"y":1,"r":0.2,"g":1,"b":0.7098039215686275,"a":1,"id":"control-point-11","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.4,"y":0,"r":1,"g":1,"b":1,"a":1,"id":"control-point-12","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.4,"y":0.2,"r":0.8784313725490196,"g":1,"b":0.9568627450980393,"a":1,"id":"control-point-13","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.4983957219251337,"y":0.33743315508021393,"r":0.7607843137254902,"g":1,"b":0.9137254901960784,"a":1,"id":"control-point-14","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.5390374331550802,"y":0.6796791443850267,"r":0.39215686274509803,"g":0.8705882352941177,"b":0.6941176470588235,"a":1,"id":"control-point-15","uPosTanX":0.23,"uNegTanX":0.23,"uPosTanY":0.05,"uNegTanY":0.05,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.4,"y":0.8,"r":0.5215686274509804,"g":1,"b":0.8235294117647058,"a":1,"id":"control-point-16","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.4,"y":1,"r":0.4,"g":1,"b":0.7803921568627451,"a":1,"id":"control-point-17","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.6,"y":0,"r":1,"g":1,"b":1,"a":1,"id":"control-point-18","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.6,"y":0.2,"r":0.9215686274509803,"g":1,"b":0.9725490196078431,"a":1,"id":"control-point-19","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.6780748663101605,"y":0.35454545454545455,"r":0.8392156862745098,"g":1,"b":0.9411764705882353,"a":1,"id":"control-point-20","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.7026737967914438,"y":0.6475935828877005,"r":0.7607843137254902,"g":1,"b":0.9137254901960784,"a":1,"id":"control-point-21","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.6427807486631016,"y":0.886096256684492,"r":0.6784313725490196,"g":1,"b":0.8823529411764706,"a":1,"id":"control-point-22","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.6,"y":1,"r":0.6,"g":1,"b":0.8549019607843137,"a":1,"id":"control-point-23","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.8,"y":0,"r":1,"g":1,"b":1,"a":1,"id":"control-point-24","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.8,"y":0.2,"r":0.9607843137254902,"g":1,"b":0.984313725490196,"a":1,"id":"control-point-25","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.8,"y":0.4,"r":0.9215686274509803,"g":1,"b":0.9686274509803922,"a":1,"id":"control-point-26","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.8641711229946524,"y":0.593048128342246,"r":0.8784313725490196,"g":1,"b":0.9568627450980393,"a":1,"id":"control-point-27","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.8,"y":0.8,"r":0.8392156862745098,"g":1,"b":0.9411764705882353,"a":1,"id":"control-point-28","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":0.8,"y":1,"r":0.8,"g":1,"b":0.9254901960784314,"a":1,"id":"control-point-29","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":1,"y":0,"r":1,"g":1,"b":1,"a":1,"id":"control-point-30","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":1,"y":0.2,"r":1,"g":1,"b":1,"a":1,"id":"control-point-31","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":1,"y":0.4,"r":1,"g":1,"b":1,"a":1,"id":"control-point-32","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":1,"y":0.6,"r":1,"g":1,"b":1,"a":1,"id":"control-point-33","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":1,"y":0.8,"r":1,"g":1,"b":1,"a":1,"id":"control-point-34","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2},{"x":1,"y":1,"r":1,"g":1,"b":1,"a":1,"id":"control-point-35","uPosTanX":0.2,"uNegTanX":0.2,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.2,"vNegTanY":0.2}]`
  },
  {
    "id": 3,
    "order": 3,
    "thumbnail": "thumbnail003.png",
    "meshGradientDefinition": `[{"x":0,"y":0,"r":1,"g":1,"b":1,"a":1,"id":"control-point-0","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":0,"y":0.3333333333333333,"r":1,"g":1,"b":1,"a":1,"id":"control-point-1","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":0,"y":0.6666666666666666,"r":0,"g":0.6666666666666666,"b":0.6666666666666666,"a":1,"id":"control-point-2","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":0,"y":1,"r":0,"g":1,"b":1,"a":1,"id":"control-point-3","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":0.3333333333333333,"y":0,"r":1,"g":1,"b":1,"a":1,"id":"control-point-4","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":0.27647058823529413,"y":0.2485294117647059,"r":1,"g":1,"b":1,"a":1,"id":"control-point-5","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":0.26413690476190477,"y":0.5758928571428571,"r":0.3333333333333333,"g":0.6666666666666666,"b":0.6666666666666666,"a":1,"id":"control-point-6","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":0.3333333333333333,"y":1,"r":0.3333333333333333,"g":1,"b":1,"a":1,"id":"control-point-7","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":0.6666666666666666,"y":0,"r":1,"g":1,"b":1,"a":1,"id":"control-point-8","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":0.7,"y":0.2235294117647059,"r":1,"g":1,"b":1,"a":1,"id":"control-point-9","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":0.7328869047619048,"y":0.6845238095238095,"r":1,"g":1,"b":1,"a":1,"id":"control-point-10","uPosTanX":0.56,"uNegTanX":0.56,"uPosTanY":-0.44,"uNegTanY":-0.44,"vPosTanX":0.26,"vNegTanX":0.26,"vPosTanY":0.76,"vNegTanY":0.76},{"x":0.6666666666666666,"y":1,"r":0.6666666666666666,"g":1,"b":1,"a":1,"id":"control-point-11","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":1,"y":0,"r":1,"g":1,"b":1,"a":1,"id":"control-point-12","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":1,"y":0.3333333333333333,"r":1,"g":0.3333333333333333,"b":0.3333333333333333,"a":1,"id":"control-point-13","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":1,"y":0.6666666666666666,"r":1,"g":0.6666666666666666,"b":0.6666666666666666,"a":1,"id":"control-point-14","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333},{"x":1,"y":1,"r":1,"g":1,"b":1,"a":1,"id":"control-point-15","uPosTanX":0.3333333333333333,"uNegTanX":0.3333333333333333,"uPosTanY":0,"uNegTanY":0,"vPosTanX":0,"vNegTanX":0,"vPosTanY":0.3333333333333333,"vNegTanY":0.3333333333333333}]`
  },
];

export function getGradientCollection() {
  return gradientCollection.sort(compareOrder);
}

export function getReducedGradientCollection(collection) {
  if (!collection) return null;

  var reducedCollection = [];
  collection.forEach(grad => {
    reducedCollection.push({
      "id": grad.id,
      "order": grad.order,
      "thumbnail": grad.thumbnail,
    });
  });
  return reducedCollection.sort(compareOrder);
}

export function getCustomGradientCollection() {
  try {
    // TODO
    let gradientJson = readFromFile(MSPluginManager.mainPluginsFolderURL().path() + '/meshgradients.json');
  } catch (e) {
    //console.log("No custom gradients stored.");
    return null;
  }
}

export function clog(message) {
  if (logsEnabled)
    console.log(message);
}

export function getAcquiredLicense() {
  return acquiredLicense;
}

export function analytics(action) {
  var res = track("UA-191923189-1", "event", {
    ec: "command",
    ea: action,
  });
}

function compareOrder(a, b) {
  if (a.order < b.order) {
    return -1;
  }
  if (a.order > b.order) {
    return 1;
  }
  return 0;
}


function readFromFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }));
}

function tryParseJSON(jsonString) {
  try {
    var o = JSON.parse(jsonString);
    if (o && typeof o === "object" && o !== null) {
      return o;
    }
  }
  catch (e) { }

  return false;
}


//d9-03
function curl_async(args, isRegistering) {
  var task = NSTask.alloc().init();
  task.setLaunchPath("/usr/bin/curl");
  task.setArguments(args);
  var outputPipe = NSPipe.pipe();
  var errorPipe = NSPipe.pipe();
  task.setStandardOutput(outputPipe);
  task.setStandardError(errorPipe);
  task.launch();
  task.waitUntilExit();
  var status = task.terminationStatus();

  var errorData = errorPipe.fileHandleForReading().readDataToEndOfFile();
  var errorString = NSString.alloc().initWithData_encoding(errorData, NSUTF8StringEncoding);

  if (status == 0) {
    var responseData = outputPipe.fileHandleForReading().readDataToEndOfFile();
    var responseString = NSString.alloc().initWithData_encoding(responseData, NSUTF8StringEncoding);
    var parsed = tryParseJSON(responseString);


    if (parsed.success) {
      if (!isRegistering) {
        if (parsed.purchase != null) {
          if (parsed.purchase.variants.indexOf("Team") > 0)
            acquiredLicense = "Team license";
          else
            acquiredLicense = "Single";
        }

        return valStatus.app;
      }
      else {
        if (parsed.purchase != null) {
          if (parsed.purchase.variants.indexOf("Team") > 0) {
            console.log("Merge Duplicates - Registering license: Team license");
            return valStatus.app;
          }
          else {
            var availableSeats = 1;
            acquiredLicense = "Single";

            if (parsed.uses > availableSeats) {
              console.log("Merge Duplicates - Registering license: " + acquiredLicense + " - Seats (" + parsed.uses + ") exceeded license (" + availableSeats + ").");
              return valStatus.over;
            }
            else {
              console.log("Merge Duplicates - Registering license: " + acquiredLicense);
              return valStatus.app;
            }
          }
        }
        else
          return valStatus.app;
      }
    }
    else
      return valStatus.no;
  } else {
    return valStatus.noCon;
  }
}

//d9-03



//d9-04

export function IsInTrial() {
  try {
    // const today = new Date()
    // const tomorrow = new Date(today)
    // tomorrow.setDate(tomorrow.getDate() - 7)
    //Settings.setSettingForKey('meshGradients-startTime', tomorrow)
    //Settings.setSettingForKey('meshGradients-startTime', null)

    var startTime = Settings.settingForKey('meshGradients-startTime');
    if (startTime)
      return startTime;
    else
      return null;
  } catch (e) {
    return null;
  }
}

export function ExiGuthrie() {
  try {
    var licenseKey = Settings.settingForKey('meshGradients-licenseKey');
    if (licenseKey)
      return Guthrie(licenseKey, false);
    else
      return false;
  } catch (e) {
    return false;
  }
}

export function Guthrie(licenseKey, isRegistering) {
  var args = ["-d", "product_permalink=meshgradients", "-d", "license_key=" + licenseKey + "", "-d", "increment_uses_count=" + isRegistering.toString() + "", "https://api.gumroad.com/v2/licenses/verify"];
  return curl_async(args, isRegistering);
}

//d9-04
