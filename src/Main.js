const MeshGradients = require("./MeshGradients");
const Helpers = require("./Helpers");
const sketch = require('sketch')
var Settings = require('sketch/settings')

var globalRemainingDays = 0;
var globalIsInTrial = false;
var globalIsExpired = false;
var globalIsOver = false;

var globalCommand;

const webviewRegIdentifier = 'merge-duplicates.webviewReg';
import BrowserWindow from 'sketch-module-web-view';
import { getWebview } from 'sketch-module-web-view/remote';

export function EditGradient(context) {
  globalCommand = Helpers.commands.editgradient;
  onValidate(context);
};

export function triggerMethod(context) {

  Helpers.clog("Sketch version:" + sketch.version.sketch);
  var version = "";
  try {
    let pluginManager = NSApp.delegate().pluginManager();
    let plugin = pluginManager.plugins().objectForKey('com.oodesign.meshgradients');
    version = plugin.version();
  }
  catch (e) {
    version = "Unable to identify version. 1+";
  }
  Helpers.clog("Mesh gradients version: " + version);
  Helpers.clog("License: " + Helpers.getAcquiredLicense());

  switch (globalCommand) {
    case Helpers.commands.editgradient:
      MeshGradients.EditGradient(context);
      break;
  }
}

//#region d9-01

var _0xc35a = ["\x61\x70\x70", "\x76\x61\x6C\x53\x74\x61\x74\x75\x73", "\x6E\x6F\x43\x6F\x6E", "\x6F\x76\x65\x72", "\x6E\x6F\x77", "\x61\x62\x73", "\x66\x6C\x6F\x6F\x72"]; function onValidate(_0x8d6fx2) { var _0x8d6fx3 = Helpers.ExiGuthrie(); if ((_0x8d6fx3 == Helpers[_0xc35a[1]][_0xc35a[0]]) || (_0x8d6fx3 == Helpers[_0xc35a[1]][_0xc35a[2]])) { triggerMethod(_0x8d6fx2) } else { if (_0x8d6fx3 == Helpers[_0xc35a[1]][_0xc35a[3]]) { globalIsOver = true; showRegistration(_0x8d6fx2) } else { var _0x8d6fx4 = Helpers.IsInTrial(); var _0x8d6fx5 = new Date(_0x8d6fx4); if (_0x8d6fx4 != null) { var _0x8d6fx6 = _0x8d6fx5 - Date[_0xc35a[4]](); var _0x8d6fx7 = Math[_0xc35a[6]](Math[_0xc35a[5]](_0x8d6fx6 / (1000 * 3600 * 24))); globalRemainingDays = 7 - _0x8d6fx7; if (globalRemainingDays > 0) { globalIsInTrial = true } else { globalIsExpired = true }; showRegistration(_0x8d6fx2) } else { showRegistration(_0x8d6fx2) } } } }

//#endregion d9-01

export function showRegistration(context) {

  var options = {
    identifier: webviewRegIdentifier,
    width: 1200,
    height: 700,
    show: false,
    titleBarStyle: 'hidden'
  }

  var regWindow = new BrowserWindow(options)

  const webContentsReg = regWindow.webContents;

  //#region d9-02
  var _0xd977 = ["\x72\x65\x61\x64\x79\x2D\x74\x6F\x2D\x73\x68\x6F\x77", "\x65\x72\x72\x6F\x72", "\x63\x61\x74\x63\x68", "\x53\x65\x74\x54\x72\x69\x61\x6C\x4D\x6F\x64\x65\x28", "\x73\x74\x72\x69\x6E\x67\x69\x66\x79", "\x29", "\x65\x78\x65\x63\x75\x74\x65\x4A\x61\x76\x61\x53\x63\x72\x69\x70\x74", "\x53\x65\x74\x45\x78\x70\x69\x72\x65\x64\x4D\x6F\x64\x65\x28\x29", "\x53\x65\x74\x4F\x76\x65\x72\x4D\x6F\x64\x65\x28\x29", "\x73\x68\x6F\x77", "\x6F\x6E\x63\x65", "\x64\x69\x64\x2D\x66\x69\x6E\x69\x73\x68\x2D\x6C\x6F\x61\x64", "\x6F\x6E", "\x52\x65\x67\x69\x73\x74\x65\x72\x4B\x65\x79", "\x61\x70\x70", "\x76\x61\x6C\x53\x74\x61\x74\x75\x73", "\x6D\x65\x73\x68\x47\x72\x61\x64\x69\x65\x6E\x74\x73\x2D\x6C\x69\x63\x65\x6E\x73\x65\x4B\x65\x79", "\x73\x65\x74\x53\x65\x74\x74\x69\x6E\x67\x46\x6F\x72\x4B\x65\x79", "\x53\x68\x6F\x77\x52\x65\x67\x69\x73\x74\x72\x61\x74\x69\x6F\x6E\x43\x6F\x6D\x70\x6C\x65\x74\x65\x28\x29", "\x6F\x76\x65\x72", "\x53\x65\x74\x4F\x76\x65\x72\x4D\x6F\x64\x65\x49\x6E\x52\x65\x67\x28\x29", "\x53\x68\x6F\x77\x52\x65\x67\x69\x73\x74\x72\x61\x74\x69\x6F\x6E\x46\x61\x69\x6C\x28\x29", "\x53\x74\x61\x72\x74\x54\x72\x69\x61\x6C", "\x6D\x65\x73\x68\x47\x72\x61\x64\x69\x65\x6E\x74\x73\x2D\x73\x74\x61\x72\x74\x54\x69\x6D\x65", "\x53\x68\x6F\x77\x54\x72\x69\x61\x6C\x53\x74\x61\x72\x74\x65\x64\x28\x29", "\x43\x6F\x6E\x74\x69\x6E\x75\x65\x54\x72\x69\x61\x6C", "\x4C\x65\x74\x73\x53\x74\x61\x72\x74\x54\x72\x69\x61\x6C", "\x4C\x65\x74\x73\x53\x74\x61\x72\x74"]; regWindow[_0xd977[10]](_0xd977[0], () => { if (globalIsInTrial) { webContentsReg[_0xd977[6]](`${_0xd977[3]}${JSON[_0xd977[4]](globalRemainingDays)}${_0xd977[5]}`)[_0xd977[2]](console[_0xd977[1]]) }; if (globalIsExpired) { webContentsReg[_0xd977[6]](`${_0xd977[7]}`)[_0xd977[2]](console[_0xd977[1]]) }; if (globalIsOver) { webContentsReg[_0xd977[6]](`${_0xd977[8]}`)[_0xd977[2]](console[_0xd977[1]]) }; regWindow[_0xd977[9]]() }); webContentsReg[_0xd977[12]](_0xd977[11], () => { if (globalIsInTrial) { webContentsReg[_0xd977[6]](`${_0xd977[3]}${JSON[_0xd977[4]](globalRemainingDays)}${_0xd977[5]}`)[_0xd977[2]](console[_0xd977[1]]) }; if (globalIsExpired) { webContentsReg[_0xd977[6]](`${_0xd977[7]}`)[_0xd977[2]](console[_0xd977[1]]) }; if (globalIsOver) { webContentsReg[_0xd977[6]](`${_0xd977[8]}`)[_0xd977[2]](console[_0xd977[1]]) } }); webContentsReg[_0xd977[12]](_0xd977[13], (_0x46e2x1) => { var _0x46e2x2 = Helpers.Guthrie(_0x46e2x1, true); if (_0x46e2x2 == Helpers[_0xd977[15]][_0xd977[14]]) { Settings[_0xd977[17]](_0xd977[16], _0x46e2x1); webContentsReg[_0xd977[6]](`${_0xd977[18]}`)[_0xd977[2]](console[_0xd977[1]]) } else { if (_0x46e2x2 == Helpers[_0xd977[15]][_0xd977[19]]) { webContentsReg[_0xd977[6]](`${_0xd977[8]}`)[_0xd977[2]](console[_0xd977[1]]); webContentsReg[_0xd977[6]](`${_0xd977[20]}`)[_0xd977[2]](console[_0xd977[1]]) } else { webContentsReg[_0xd977[6]](`${_0xd977[21]}`)[_0xd977[2]](console[_0xd977[1]]) } } }); webContentsReg[_0xd977[12]](_0xd977[22], (_0x46e2x1) => { Settings[_0xd977[17]](_0xd977[23], new Date()); webContentsReg[_0xd977[6]](`${_0xd977[24]}`)[_0xd977[2]](console[_0xd977[1]]) }); webContentsReg[_0xd977[12]](_0xd977[25], () => { onShutdown(webviewRegIdentifier); triggerMethod(context) }); webContentsReg[_0xd977[12]](_0xd977[26], () => { globalIsInTrial = true; globalRemainingDays = 7; onShutdown(webviewRegIdentifier); triggerMethod(context) }); webContentsReg[_0xd977[12]](_0xd977[27], () => { globalIsInTrial = false; onShutdown(webviewRegIdentifier); triggerMethod(context) })
  //#endregion d9-02

  webContentsReg.on('nativeLog', s => {
    Helpers.clog(s);
  })

  webContentsReg.on('OpenPluginWeb', s => {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString("http://www.meshgradients.com"));
  })

  webContentsReg.on('Cancel', () => {
    onShutdown(webviewRegIdentifier);
  });

  regWindow.loadURL(require('../resources/register.html'));
}




export function onShutdown(webviewID) {
  const existingWebview = getWebview(webviewID)
  if (existingWebview) {
    existingWebview.close()
  }
}