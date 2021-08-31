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

  var state = Helpers.ExiGuthrie();
  if ((state == Helpers.valStatus.app) || (state == Helpers.valStatus.noCon)) {
    triggerMethod(context)
  }
  else {
    if (state == Helpers.valStatus.over) {
      globalIsOver = true;
      showRegistration(context);
    }
    else {
      var trialDate = Helpers.IsInTrial();
      var startTrialDate = new Date(trialDate);
      if (trialDate != null) {
        var Difference_In_Time = startTrialDate - Date.now();
        var Difference_In_Days = Math.floor(Math.abs(Difference_In_Time / (1000 * 3600 * 24)));
        globalRemainingDays = 7 - Difference_In_Days;
        if (globalRemainingDays > 0)
          globalIsInTrial = true;
        else
          globalIsExpired = true;


        showRegistration(context);
      }
      else {
        showRegistration(context);
      }
    }
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

    // if (state == Helpers.valStatus.app) {
    //   Settings.setSettingForKey('meshGradients-licenseKey', parameters.licenseKey)
    //   webContentsReg.executeJavaScript(`ShowRegistrationComplete()`).catch(console.error);
    // }
    // else {
    //   if (state == Helpers.valStatus.over) {
    //     webContentsReg.executeJavaScript(`SetOverMode()`).catch(console.error);
    //     webContentsReg.executeJavaScript(`SetOverModeInReg()`).catch(console.error);
    //   }
    //   else
    //     webContentsReg.executeJavaScript(`ShowRegistrationFail()`).catch(console.error);
    // }
  });

  webContentsReg.on('OpenURL', (url) => {
    NSWorkspace.sharedWorkspace().openURL(NSURL.URLWithString(url));
  });

  webContentsReg.on('StartTrial', (licenseKey) => {
    Settings.setSettingForKey('meshGradients-startTime', new Date())
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