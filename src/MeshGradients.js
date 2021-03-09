import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
const sketch = require('sketch');
var Settings = require('sketch/settings')
var ShapePath = require('sketch/dom').ShapePath;
var Rectangle = require('sketch/dom').Rectangle;
var Style = require('sketch/dom').Style;
var Helpers = require("./Helpers");

var document = sketch.getSelectedDocument();

const webviewIdentifier = 'meshgradients.webview'

export function EditGradient(context) {
  const options = {
    identifier: webviewIdentifier,
    width: 1200,
    height: 700,
    remembersWindowFrame: true,
    show: false,
    titleBarStyle: 'hidden'
  }
  const browserWindow = new BrowserWindow(options);
  const webContents = browserWindow.webContents;
  var layerMeshGradientDefinition = null;

  var gradientCollection = Helpers.getGradientCollection();
  var reducedGradientCollection = Helpers.getReducedGradientCollection(gradientCollection);
  var customGradientCollection = Helpers.getCustomGradientCollection();
  var reducedCustomGradientCollection = Helpers.getReducedGradientCollection(customGradientCollection);

  var selectedLayer = null;
  if (document.selectedLayers.length > 0) {
    selectedLayer = document.selectedLayers.layers[0];
    if (Settings.layerSettingForKey(selectedLayer, 'MeshGradientDefinition')) {
      layerMeshGradientDefinition = Settings.layerSettingForKey(selectedLayer, 'MeshGradientDefinition');
    }
  }

  browserWindow.loadURL(require('../resources/meshgradients.html'));

  browserWindow.once('ready-to-show', () => {
    browserWindow.show()
  })

  webContents.on('did-finish-load', () => {
    webContents.executeJavaScript(`LoadMesh(${JSON.stringify(layerMeshGradientDefinition)}, ${JSON.stringify(reducedGradientCollection)})`).catch(console.error);
  })

  webContents.on('DontShowWarningsAgain', () => {
    console.log("Saving showWarnings")
    Settings.setGlobalSettingForKey('showWarnings', false);
  });

  webContents.on('Cancel', () => {
    onShutdown(webviewIdentifier);
  });

  webContents.on('ChangeGradient', (gradientId) => {
    let gradientDefinition = gradientCollection.find(g => g.id === gradientId).meshGradientDefinition;
    webContents.executeJavaScript(`ChangeGradient(${JSON.stringify(gradientDefinition)})`).catch(console.error);
  });

  webContents.on('ConfirmMeshGradient', (meshGradientBase64, patchPoints) => {

    var parent = (document.selectedLayers.length > 0) ? ((document.selectedLayers.layers[0].type == "Artboard") ? document.selectedLayers.layers[0] : ((document.selectedLayers.layers[0].parent != null) ? document.selectedLayers.layers[0].parent : document.selectedPage)) : document.selectedPage;
    if (parent == null) parent = document.selectedPage;

    let layer;
    if ((document.selectedLayers.length > 0) && (document.selectedLayers.layers[0].type == "ShapePath")) {
      layer = document.selectedLayers.layers[0];
      layer.style.fills = [{
        fillType: Style.FillType.Pattern,
        pattern: {
          patternType: Style.PatternFillType.Fill,
          image: { base64: meshGradientBase64 }
        },
      }]
    }
    else {
      layer = new ShapePath({
        name: "Mesh gradient",
        frame: new Rectangle(0, 0, 1000, 1000),
        style: {
          fills: [{
            fillType: Style.FillType.Pattern,
            pattern: {
              patternType: Style.PatternFillType.Fill,
              image: { base64: meshGradientBase64 }
            },
          }]
        },
        parent: parent
      });
    }

    //console.log(patchPoints);
    Settings.setLayerSettingForKey(layer, 'MeshGradientDefinition', patchPoints);
    onShutdown(webviewIdentifier);
  });

  webContents.on('nativeLog', s => {
    console.log(s);
  })
};

export function LogLayerData(context) {
  var layer = document.selectedLayers.layers[0];
  var definition = Settings.layerSettingForKey(layer, 'MeshGradientDefinition');

  var parsed = JSON.parse(definition);
  console.log(parsed);
};

export function onShutdown(webviewID) {
  const existingWebview = getWebview(webviewID)
  if (existingWebview) {
    existingWebview.close()
  }
}

