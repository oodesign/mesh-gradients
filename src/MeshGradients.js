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

  Helpers.clog("Initializing Mesh editor");

  const browserWindow = new BrowserWindow(options);
  const webContents = browserWindow.webContents;
  let layerMeshGradientDefinition = null;
  let shouldShowWarnings = Settings.settingForKey('showWarnings');

  Helpers.clog("Recovering gradient collections");

  let gradientCollection = Helpers.getGradientCollection();
  let reducedGradientCollection = Helpers.getReducedGradientCollection(gradientCollection);
  let customGradientCollection = Helpers.getCustomGradientCollection();
  let reducedCustomGradientCollection = Helpers.getReducedGradientCollection(customGradientCollection);


  let selectedLayer = null;
  if (document.selectedLayers.length > 0) {
    Helpers.clog("Getting selected layer information");
    selectedLayer = document.selectedLayers.layers[0];
    if (Settings.layerSettingForKey(selectedLayer, 'MeshGradientDefinition')) {
      let layersWithMeshGradientFill = selectedLayer.style.fills.filter(fill => ((fill.fillType == Style.FillType.Pattern) && (fill.pattern.image.size.width == 5000)))

      if (layersWithMeshGradientFill.length > 0)
        layerMeshGradientDefinition = Settings.layerSettingForKey(selectedLayer, 'MeshGradientDefinition');
      else
        Settings.setLayerSettingForKey(selectedLayer, 'MeshGradientDefinition', null);
    }
  }

  let allColorVariables = Helpers.getDefinedColorVariables(true);

  browserWindow.loadURL(require('../resources/meshgradients.html'));

  browserWindow.once('ready-to-show', () => {
    browserWindow.show()
  })

  webContents.on('did-finish-load', () => {
    if (layerMeshGradientDefinition)
      Helpers.clog("Editing mesh gradient");
    else
      Helpers.clog("Load mesh gradient editor");

    webContents.executeJavaScript(`LoadMesh(${JSON.stringify(layerMeshGradientDefinition)}, ${JSON.stringify(reducedGradientCollection)}, ${JSON.stringify(reducedCustomGradientCollection)}, ${shouldShowWarnings}, ${JSON.stringify(allColorVariables)})`).catch(console.error);
  })

  webContents.on('DontShowWarningsAgain', () => {
    Helpers.clog("Marked to not show warnings again");
    Settings.setSettingForKey('showWarnings', false);
  });

  webContents.on('ChangeGradient', (gradientId) => {
    Helpers.clog("Switching to gradient:" + gradientId);
    let gradientDefinition = gradientCollection.find(g => g.id === gradientId).meshGradientDefinition;
    webContents.executeJavaScript(`ChangeGradient(${JSON.stringify(gradientDefinition)})`).catch(console.error);
  });

  webContents.on('ConfirmMeshGradient', (meshGradientBase64, patchPoints) => {

    Helpers.clog("Saving gradient");
    let parent = (document.selectedLayers.length > 0) ? ((document.selectedLayers.layers[0].type == "Artboard") ? document.selectedLayers.layers[0] : ((document.selectedLayers.layers[0].parent != null) ? document.selectedLayers.layers[0].parent : document.selectedPage)) : document.selectedPage;
    if (parent == null) parent = document.selectedPage;

    let layer;
    if ((document.selectedLayers.length > 0) && ((document.selectedLayers.layers[0].type == "ShapePath") || (document.selectedLayers.layers[0].type == "Shape"))) {
      Helpers.clog("-- Applying to selected shape");
      layer = document.selectedLayers.layers[0];
    }
    else {
      Helpers.clog("-- Creating new layer");
      layer = new ShapePath({
        name: "Mesh gradient",
        frame: new Rectangle(0, 0, 1000, 1000),
        parent: parent
      });
    }

    layer.style.fills = [{
      fillType: Style.FillType.Pattern,
      pattern: {
        patternType: Style.PatternFillType.Fill,
        image: { base64: meshGradientBase64 }
      },
    },
    {
      fillType: Style.FillType.Pattern,
      pattern: {
        tileScale: 0.5,
        patternType: Style.PatternFillType.Tile,
        image: { opacity: 0.05, base64: Helpers.noise1 }
      },
    }];

    Helpers.clog("-- Adding small noise to reduce gradient banding");
    layer.sketchObject.style().enabledFills()[1].contextSettings().setBlendMode(7);
    layer.sketchObject.style().enabledFills()[1].contextSettings().setOpacity(0.03);

    //console.log(patchPoints);
    Helpers.clog("-- Storing mesh gradient definition in layer");
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

