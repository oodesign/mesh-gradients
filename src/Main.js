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
  Helpers.analytics("EditGradient");
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

function onValidate(context) {

  console.log("Stored session");
  console.log(Settings.settingForKey('oo.meshGradients.session'));
  console.log("Stored trial: " + Settings.settingForKey('oo.meshGradients.trial'));

  Settings.setSettingForKey('oo.meshGradients.session', null);

  var state = Helpers.VerifyLicense();
  console.log("Verifying local license:");
  console.log(Settings.settingForKey('oo.meshGradients.session'));

  console.log(state);
  switch (state) {
    case Helpers.valStatus.app:
      triggerMethod(context);
      break;
    case Helpers.valStatus.trial:
      globalRemainingDays = Helpers.calculateRemainingDays(new Date(Settings.settingForKey('oo.meshGradients.trial')),Date.now());
      globalIsInTrial = true;
      showRegistration(context);
      break;
    case Helpers.valStatus.over:
      globalIsOver = true;
      showRegistration(context);
      break;
    case Helpers.valStatus.no:
      showRegistration(context);
      break;
    case Helpers.valStatus.noCon:
      triggerMethod(context);
      break;
  }
}

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

  regWindow.once('ready-to-show', () => {
    if (globalIsInTrial) {
      webContentsReg.executeJavaScript(`SetTrialMode(${JSON.stringify(globalRemainingDays)})`).catch(console.error);
    }
    if (globalIsExpired) {
      webContentsReg.executeJavaScript(`SetExpiredMode()`).catch(console.error);
    }
    if (globalIsOver) {
      webContentsReg.executeJavaScript(`SetOverMode()`).catch(console.error);
    }

    regWindow.show()
  });

  webContentsReg.on('did-finish-load', () => {
    if (globalIsInTrial) {
      webContentsReg.executeJavaScript(`SetTrialMode(${JSON.stringify(globalRemainingDays)})`).catch(console.error);
    }
    if (globalIsExpired) {
      webContentsReg.executeJavaScript(`SetExpiredMode()`).catch(console.error);
    }
    if (globalIsOver) {
      webContentsReg.executeJavaScript(`SetOverMode()`).catch(console.error);
    }
  })



  webContentsReg.on('RegisterKey', (parameters) => {

    const email = parameters.email;
    const licenseKey = parameters.licenseKey;
    console.log("Receiving RegisterKey: " + email + " - " + licenseKey);



    var gumroadResponse = Helpers.CheckGumroad(parameters.licenseKey, false);
    if (gumroadResponse) {
      const variant = gumroadResponse.purchase.variants;
      console.log("Variant is:" + variant);
      webContentsReg.executeJavaScript(`AttemptLogin(${JSON.stringify(email)},${JSON.stringify(licenseKey)},${JSON.stringify(variant)},${JSON.stringify(Helpers.uuidv4())})`).catch(console.error);
    }


  });

  webContentsReg.on('OpenURL', (url) => {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
  });

  webContentsReg.on('StartTrial', (licenseKey) => {
    Settings.setSettingForKey('oo.meshGradients.trial', new Date())
    webContentsReg.executeJavaScript(`ShowTrialStarted()`).catch(console.error);
  });


  webContentsReg.on('ContinueTrial', () => {
    onShutdown(webviewRegIdentifier);
    triggerMethod(context);
  });

  webContentsReg.on('LetsStartTrial', () => {
    globalIsInTrial = true;
    globalRemainingDays = 7;
    onShutdown(webviewRegIdentifier);
    triggerMethod(context);
  });

  webContentsReg.on('LetsStart', () => {
    globalIsInTrial = false;
    onShutdown(webviewRegIdentifier);
    triggerMethod(context);
  });

  webContentsReg.on('OnLoginSuccessful', (email, licenseKey) => {
    Settings.setSettingForKey('oo.meshGradients.session', {
      "active": true,
      "timeStamp": Date.now(),
      "email": email,
      "licenseKey": licenseKey
    });

    webContentsReg.executeJavaScript(`ShowRegistrationComplete()`).catch(console.error);
    // }
    // else {
    //   if (state == Helpers.valStatus.over) {
    //     
    //     
    //   }
    //   else
    //     webContentsReg.executeJavaScript(`ShowRegistrationFail()`).catch(console.error);
    // }


  });



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