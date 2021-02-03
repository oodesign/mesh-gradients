document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
})

window.cancelAssignation = () => {
    window.postMessage('Cancel');
}

document.getElementById('btnCancel').addEventListener("click", () => {
    window.postMessage("nativeLog", "WV - Cancel");
    cancelAssignation();
});