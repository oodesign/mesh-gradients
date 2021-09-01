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


// disable the context menu (eg. the right click menu) to have a more native feel
document.addEventListener('contextmenu', (e) => {
  //e.preventDefault()
})

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

document.getElementById('btnGoBack').addEventListener('click', () => {
  document.getElementById('registerForm').className = "";
  document.getElementById('ctaForm').className = "yFadeIn";
  document.getElementById('warningMessage').className = "rowAuto warningText";
})

document.getElementById('btnRegister').addEventListener('click', () => {
  document.getElementById('warningMessage').className = "rowAuto warningText";

  window.postMessage("RegisterKey", {
    email: document.getElementById("inputEmail").value,
    licenseKey: document.getElementById("inputLicense").value
  });
})



window.AttemptLogin = (email, licenseKey, variant, ref) => {
  console.log("Gonna attempt login:" + email + " - " + licenseKey + " - " + variant + " - " + ref);

  firebase.initializeApp(firebaseConfig);
  var db = firebase.firestore();

  db.collection("loginAttempts").doc(ref).set({
    email: email,
    licenseKey: licenseKey,
    variant: variant,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    linkUsed: false,
    linkExpired: false,
    app: "Sketch"
  })

  const unsubscribe = db.collection("loginAttempts").doc(ref).onSnapshot((doc) => {

    if (doc.data().status == 200) {
      window.postMessage("OnLoginSuccessful", email, licenseKey);
      console.log("Unsubscribing");
      unsubscribe();
      console.log("Unsubscribed it");
    }
  });

  setTimeout(() => {
    unsubscribe();
    console.log("Unsubscribed it due to timeout");
    //TODO Handle Timeout in UI
  }, 60000);

  window.postMessage("OpenURL", 'https://auth.meshgradients.com?ref=' + ref);

};

window.ShowRegistrationComplete = () => {
  document.getElementById('ctaForm').className = "yFadeOut";
  document.getElementById('registerForm').className = "yFadeOut";
  document.getElementById('confirmationForm').className = "yFadeIn";
};

window.ShowTrialStarted = () => {
  document.getElementById('ctaForm').className = "yFadeOut";
  document.getElementById('startTrialForm').className = "yFadeIn";
};

window.ShowRegistrationFail = () => {
  document.getElementById('warningMessage').className = "rowAuto warningText warningTextVisible";
};

window.cancelAssignation = () => {
  window.postMessage('Cancel');
}

window.SetTrialMode = (remainingDays) => {
  document.getElementById('registerMessage').innerHTML = `Merge Duplicates helps you remove duplicate symbols and styles.<br/>
                                                        You still have <span class="primaryText"><b>`+ remainingDays + ` days</b></span> to push it to the limit. Go merge everything! `;

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

document.getElementById("inputEmail").value = "ootomir@gmail.com"
document.getElementById("inputLicense").value = "B2721513-41D547DB-BFF282F4-79B67612"

