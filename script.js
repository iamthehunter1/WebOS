
function updateTime() {
    var timeElement = document.getElementById("timeElement");
    timeElement.textContent = new Date().toLocaleString();
}

updateTime();
setInterval(updateTime, 1000);

var windowLevel = 20;

function openWindow(windowId) {
    var appWindow = document.getElementById(windowId);

    if (!appWindow) {
        return;
    }

    appWindow.style.display = "block";
    windowLevel += 1;
    appWindow.style.zIndex = windowLevel;
}

function closeWindow(windowId) {
    var appWindow = document.getElementById(windowId);

    if (appWindow) {
        appWindow.style.display = "none";
    }
}

var notesText = document.getElementById("notesText");
var notesStatus = document.getElementById("notesStatus");

try {
    notesText.value = localStorage.getItem("xzenxosNotes") || "";
} catch (error) {
    notesStatus.textContent = "Browser storage is unavailable.";
}

function saveNotes() {
    try {
        localStorage.setItem("xzenxosNotes", notesText.value);
        notesStatus.textContent = "Notes saved.";
    } catch (error) {
        notesStatus.textContent = "Could not save notes in this browser.";
    }
}

function dragWindow(windowId) {
    var appWindow = document.getElementById(windowId);
    var titleBar = document.getElementById(windowId + "Header");
    var startX = 0;
    var startY = 0;
    var startLeft = 0;
    var startTop = 0;

    titleBar.addEventListener("pointerdown", function (event) {
        if (event.target.closest("button")) {
            return;
        }

        var position = appWindow.getBoundingClientRect();

        startX = event.clientX;
        startY = event.clientY;
        startLeft = position.left;
        startTop = position.top;

        appWindow.style.left = startLeft + "px";
        appWindow.style.top = startTop + "px";
        appWindow.style.transform = "none";

        windowLevel += 1;
        appWindow.style.zIndex = windowLevel;

        titleBar.setPointerCapture(event.pointerId);
    });

    titleBar.addEventListener("pointermove", function (event) {
        if (!titleBar.hasPointerCapture(event.pointerId)) {
            return;
        }

        var newLeft = startLeft + event.clientX - startX;
        var newTop = startTop + event.clientY - startY;
        var maxLeft = window.innerWidth - appWindow.offsetWidth;
        var maxTop = window.innerHeight - appWindow.offsetHeight;

        appWindow.style.left =
            Math.max(0, Math.min(newLeft, maxLeft)) + "px";

        appWindow.style.top =
            Math.max(48, Math.min(newTop, maxTop)) + "px";
    });
}

dragWindow("aboutWindow");
dragWindow("notesWindow");
