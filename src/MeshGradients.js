import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
const sketch = require('sketch');
var Settings = require('sketch/settings')
var ShapePath = require('sketch/dom').ShapePath;
var Rectangle = require('sketch/dom').Rectangle;
var Style = require('sketch/dom').Style;

var document = sketch.getSelectedDocument();

const webviewIdentifier = 'meshgradients.webview'

export function EditGradient(context) {
  console.log("Mesh gradients!");

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
    webContents.executeJavaScript(`LoadMesh(${JSON.stringify(layerMeshGradientDefinition)})`).catch(console.error);
  })

  webContents.on('Cancel', () => {
    onShutdown(webviewIdentifier);
  });

  webContents.on('ConfirmMeshGradient', (meshGradientBase64, patchPoints) => {

    console.log("Accepting mesh gradient")
    var parent = (document.selectedLayers.length > 0) ? document.selectedLayers.layers[0].parent : document.selectedPage;
    if (parent == null) parent = document.selectedPage;
    // console.log("Parent is:" + parent.name)
    // console.log("meshGradientBase64 is:")
    // console.log(meshGradientBase64)
    console.log("patchPoints is:")
    console.log(patchPoints)

    let layer;
    if ((document.selectedLayers.length > 0) && (document.selectedLayers.layers[0].type == "ShapePath")) {
      console.log("Editing layer");
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
      console.log("Creating new layer");
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

    console.log("Saving gradient");
    Settings.setLayerSettingForKey(layer, 'MeshGradientDefinition', patchPoints);

    console.log("Saved mesh gradient")
    console.log(Settings.layerSettingForKey(layer, 'MeshGradientDefinition'))

    onShutdown(webviewIdentifier);
  });



  webContents.on('nativeLog', s => {
    console.log(s);
  })
};

export function LogLayerData(context) {
  var layer = document.selectedLayers.layers[0];
  console.log(Settings.layerSettingForKey(layer, 'MeshGradientDefinition'))
};

export function onShutdown(webviewID) {
  const existingWebview = getWebview(webviewID)
  if (existingWebview) {
    existingWebview.close()
  }
}

