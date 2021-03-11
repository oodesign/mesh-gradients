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
  let layerMeshGradientDefinition = null;
  let shouldShowWarnings = Settings.settingForKey('showWarnings');

  let gradientCollection = Helpers.getGradientCollection();
  let reducedGradientCollection = Helpers.getReducedGradientCollection(gradientCollection);
  let customGradientCollection = Helpers.getCustomGradientCollection();
  let reducedCustomGradientCollection = Helpers.getReducedGradientCollection(customGradientCollection);

  let selectedLayer = null;
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
    webContents.executeJavaScript(`LoadMesh(${JSON.stringify(layerMeshGradientDefinition)}, ${JSON.stringify(reducedGradientCollection)}, ${JSON.stringify(reducedCustomGradientCollection)}, ${shouldShowWarnings})`).catch(console.error);
  })

  webContents.on('DontShowWarningsAgain', () => {
    Settings.setSettingForKey('showWarnings', false);
  });

  webContents.on('ChangeGradient', (gradientId) => {
    let gradientDefinition = gradientCollection.find(g => g.id === gradientId).meshGradientDefinition;
    webContents.executeJavaScript(`ChangeGradient(${JSON.stringify(gradientDefinition)})`).catch(console.error);
  });

  webContents.on('ConfirmMeshGradient', (meshGradientBase64, patchPoints) => {

    let parent = (document.selectedLayers.length > 0) ? ((document.selectedLayers.layers[0].type == "Artboard") ? document.selectedLayers.layers[0] : ((document.selectedLayers.layers[0].parent != null) ? document.selectedLayers.layers[0].parent : document.selectedPage)) : document.selectedPage;
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

  webContents.on('Cancel', () => {
    onShutdown(webviewIdentifier);
  });

  webContents.on('nativeLog', s => {
    console.log(s);
  })
};

export function onShutdown(webviewID) {
  const existingWebview = getWebview(webviewID)
  if (existingWebview) {
    existingWebview.close()
  }
}

