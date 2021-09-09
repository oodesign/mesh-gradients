import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBdAfT4qOkyIvkgNdITXM6rxc9ZSig0ih4",
  authDomain: "mesh-gradients.firebaseapp.com",
  projectId: "mesh-gradients",
  storageBucket: "mesh-gradients.appspot.com",
  messagingSenderId: "759056882382",
  appId: "1:759056882382:web:bb1814e7ebda17f7eece9f",
  measurementId: "G-2V9WY6B83Y"
};

var db;
var isFirebaseInitialized = false;

// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
  //e.preventDefault()
})



window.AttemptLogin = (email, licenseKey, variant, ref) => {
  console.log("Gonna attempt login:" + email + " - " + licenseKey + " - " + variant + " - " + ref);

  var timeoutTimer;

  if (!isFirebaseInitialized) {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    isFirebaseInitialized = true;
  }

  db.collection("loginAttempts").doc(ref).set({
    email: email,
    licenseKey: licenseKey,
    variant: variant,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    linkUsed: false,
    linkSignedIn: false,
    linkExpired: false,
    isNotValid: false,
    app: "Sketch"
  })

  const unsubscribe = db.collection("loginAttempts").doc(ref).onSnapshot((doc) => {
    if (doc.exists) {
      if (doc.data().status == 200) {
        window.postMessage("OnLoginSuccessful", email, licenseKey);
        console.log("Unsubscribing");
        unsubscribe();
        if (timeoutTimer) clearTimeout(timeoutTimer);
        console.log("Unsubscribed it");
      }
      else if (doc.data().isNotValid) {
        ShowRegistrationResponseFail();
        if (timeoutTimer) clearTimeout(timeoutTimer);
      }
    }
  });

  timeoutTimer = setTimeout(() => {
    unsubscribe();
    console.log("Unsubscribed it due to timeout");
    showActivationTimeout();
    console.log("Updating login attempt:" + ref);
    db.collection("loginAttempts").doc(ref).update({
      linkExpired: true
    }).catch(e => console.error(e));
  }, 60000);

  window.postMessage("OpenURL", 'https://auth.meshgradients.com?ref=' + ref);

};

window.HideForms = () => {
  document.getElementById('ctaForm').className = "yFadeOut";
  document.getElementById('registerForm').className = "yFadeOut";
  document.getElementById('awaitingForm').className = "yFadeOut";
  document.getElementById('confirmationForm').className = "yFadeOut";
  document.getElementById('issueForm').className = "yFadeOut";
  document.getElementById('activationTimeout').className = "yFadeOut";
  document.getElementById('startTrialForm').className = "yFadeOut";
}

window.ShowRegistrationInProgress = () => {
  HideForms();
  document.getElementById('awaitingForm').className = "yFadeIn";
};

window.ShowRegistrationResponseFail = () => {
  HideForms();
  document.getElementById('issueForm').className = "yFadeIn";
};

window.ShowRegistrationComplete = () => {
  HideForms();
  document.getElementById('confirmationForm').className = "yFadeIn";
};

window.showActivationTimeout = () => {
  HideForms();
  document.getElementById('activationTimeout').className = "yFadeIn";
};

window.ShowTrialStarted = () => {
  HideForms();
  document.getElementById('startTrialForm').className = "yFadeIn";
};

window.ShowRegistrationFail = (emailValid, licenseValid) => {
  if (!emailValid && licenseValid)
    document.getElementById('validationMessage').textContent = "Looks like the e-mail is not valid. May you try again?";
  else if (!emailValid && !licenseValid)
    document.getElementById('validationMessage').textContent = "Looks like the license key is not valid. May you try again?";
  else if (emailValid && !licenseValid)
    document.getElementById('validationMessage').textContent = "Looks like the license key is not valid. May you try again?";

  document.getElementById('warningMessage').className = "rowAuto warningText warningTextVisible";
};

window.cancelAssignation = () => {
  window.postMessage('Cancel');
}

window.SetTrialMode = (remainingDays) => {
  document.getElementById('registerMessage').innerHTML = `Mesh gradients helps you create awesome real mesh gradients.<br/>
                                                        You still have <span class="primaryText"><b>`+ remainingDays + ` days</b></span> to push it to the limit. Go mesh everything! `;

  document.getElementById('btnStartTrial').className = "btnStartTrial notDisplayed";
  document.getElementById('btnContinueTrial').className = "btnStartTrial";

}

window.SetExpiredMode = () => {
  document.getElementById('registerMessage').innerHTML = `Looks like your trial expired. Maybe it's a good time to get it? `;

  document.getElementById('btnStartTrial').className = "btnStartTrial notDisplayed";
  document.getElementById('btnContinueTrial').className = "btnStartTrial notDisplayed";

}

window.SetOverMode = () => {
  document.getElementById('registerHeader').innerHTML = `All seats are busy 🙈!`;

  document.getElementById('registerMessage').innerHTML = `Looks like this license has already been installed on as many devices as it was purchased for. Maybe it's a good time to get another one? <br/><br/>
                                                          If you think this is a mistake please <a href="mailto:licensing@oodesign.me">contact us</a>.`;

  document.getElementById('btnStartTrial').className = "btnStartTrial notDisplayed";
  document.getElementById('btnContinueTrial').className = "btnStartTrial notDisplayed";

}

window.SetOverModeInReg = () => {
  document.getElementById('registerForm').className = "";
  document.getElementById('ctaForm').className = "yFadeIn";
  document.getElementById('warningMessage').className = "rowAuto warningText";
}

window.initializeView = () => {

  document.getElementById('btnGetPlugin').addEventListener('click', () => {
    window.postMessage('OpenPluginWeb');
  })

  document.getElementById('btnStartTrial').addEventListener('click', () => {
    window.postMessage('StartTrial');
  })

  document.getElementById('btnContinueTrial').addEventListener('click', () => {
    window.postMessage('ContinueTrial');
  })

  document.getElementById('btnLetsStart').addEventListener('click', () => {
    window.postMessage('LetsStart');
  })

  document.getElementById('btnLetsStartTrial').addEventListener('click', () => {
    window.postMessage('LetsStartTrial');
  })

  document.getElementById('btnNavRegistration').addEventListener('click', () => {
    document.getElementById('ctaForm').className = "yFadeOut";
    document.getElementById('registerForm').className = "yFadeIn";
    document.getElementById('inputLicense').focus();
  })

  document.getElementById('btnRegisterGoBack').addEventListener('click', () => {
    document.getElementById('registerForm').className = "";
    document.getElementById('ctaForm').className = "yFadeIn";
    document.getElementById('warningMessage').className = "rowAuto warningText";
  })

  document.getElementById('btnAwaitingGoBack').addEventListener('click', () => {
    document.getElementById('awaitingForm').className = "";
    document.getElementById('registerForm').className = "yFadeIn";
    document.getElementById('warningMessage').className = "rowAuto warningText";
  })

  document.getElementById('btnIssueGoBack').addEventListener('click', () => {
    document.getElementById('issueForm').className = "";
    document.getElementById('registerForm').className = "yFadeIn";
    document.getElementById('warningMessage').className = "rowAuto warningText";
  })

  document.getElementById('btnTimeoutGoBack').addEventListener('click', () => {
    document.getElementById('activationTimeout').className = "";
    document.getElementById('registerForm').className = "yFadeIn";
    document.getElementById('warningMessage').className = "rowAuto warningText";
  })

  document.getElementById('btnRegister').addEventListener('click', () => {
    document.getElementById('warningMessage').className = "rowAuto warningText";
    document.getElementById('magicLinkEmail').textContent = "We've sent you a magic link to " + document.getElementById("inputEmail").value + ".";

    window.postMessage("RegisterKey", {
      email: document.getElementById("inputEmail").value,
      licenseKey: document.getElementById("inputLicense").value
    });
  })
}

window.onload = () => {

  initializeView();
  document.getElementById("inputEmail").value = "ootomir@gmail.com"
  document.getElementById("inputLicense").value = "B2721513-41D547DB-BFF282F4-79B67612"
}

