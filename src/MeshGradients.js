import BrowserWindow from 'sketch-module-web-view'
import { getWebview } from 'sketch-module-web-view/remote'
const sketch = require('sketch');
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

  browserWindow.loadURL(require('../resources/meshgradients.html'));

  browserWindow.once('ready-to-show', () => {
    browserWindow.show()
  })

  webContents.on('did-finish-load', () => {
  })

  webContents.on('Cancel', () => {
    onShutdown(webviewIdentifier);
  });

  webContents.on('ConfirmMeshGradient', (meshGradientBase64) => {

    console.log("Accepting mesh gradient")
    var parent = (document.selectedLayers.length > 0) ? document.selectedLayers.layers[0].parent : document.selectedPage;
    if (parent == null) parent = document.selectedPage;
    console.log("Parent is:" + parent.name)
    console.log("meshGradientBase64 is:")
    console.log(meshGradientBase64)

    let rectangle = new ShapePath({
      name: "Mesh gradient",
      frame: new Rectangle(0, 0, 1000, 1000),
      style: {
        fills: [{
          fillType: Style.FillType.Pattern,
          pattern: {
            patternType: Style.PatternFillType.Fill,
            image: { base64: meshGradientBase64}
          },
        }]
      },
      parent: parent
    })

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

