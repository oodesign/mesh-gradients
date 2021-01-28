var button = document.createElement("button");
button.innerHTML = "Show hotkeys";
button.classList.add("hotkey-button");

var body = document.getElementsByTagName("body")[0];
body.appendChild(button);

button.addEventListener ("click", function() {
  showHotkeys()
});

function showHotkeys() {
    var x = document.getElementById("hotkeys");
    if (x.style.display === "none") {
      x.style.display = "block";
      button.innerHTML = "Hide hotkeys";
    } else {
      x.style.display = "none";
      button.innerHTML = "Show hotkeys";
    }
}
