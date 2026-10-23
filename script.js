
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

var snippets = [];

var currentSnippet = null;

var snippetList = document.getElementById("snippetList");
var snippetTitle = document.getElementById("snippetTitle");
var snippetCode = document.getElementById("snippetCode");
var devPadStatus = document.getElementById("devPadStatus");

function loadSnippets() {
    try {
        snippets = JSON.parse(localStorage.getItem("xzenxosSnippets")) || [];

        if (!Array.isArray(snippets)) {
            snippets = [];
        }
    } catch (error) {
        snippets = [];
        devPadStatus.textContent = "could not load saved snippets";
    }

    refreshSnippetList();
}

function refreshSnippetList() {
    snippetList.replaceChildren();

    var firstOption = document.createElement("option");
    firstOption.value = "";
    firstOption.textContent = "choose a snippet";
    snippetList.appendChild(firstOption);

    snippets.forEach(function (snippet) {
        var option = document.createElement("option");
        option.value = snippet.id;
        option.textContent = snippet.title || "untitled snippet";
        snippetList.appendChild(option);
    });
}

function newSnippet() {
    currentSnippet = null;
    snippetList.value = "";
    snippetTitle.value = "";
    snippetCode.value = "";
    devPadStatus.textContent = "new snippet ready";
    snippetTitle.focus();
}

function saveSnippet() {
    var title = snippetTitle.value.trim();
    var code = snippetCode.value;

    if (!title) {
        devPadStatus.textContent = "enter a title before saving";
        snippetTitle.focus();
        return;
    }

    var previous = snippets.find(function (snippet) {
        return snippet.id === currentSnippet;
    });

    if (previous) {
        previous.title = title;
        previous.code = code;
    } else {
        currentSnippet = Date.now().toString();

        snippets.push({
            id: currentSnippet,
            title: title,
            code: code
        });
    }

    try {
        localStorage.setItem("xzenxosSnippets", JSON.stringify(snippets));
        refreshSnippetList();
        snippetList.value = currentSnippet;
        devPadStatus.textContent = "snippet saved";
    } catch (error) {
        devPadStatus.textContent = "could not save browser storage may be full or unavailable";
    }
}

function deleteSnippet() {
    if (!currentSnippet) {
        devPadStatus.textContent = "select a saved snippet first";
        return;
    }

    snippets = snippets.filter(function (snippet) {
        return snippet.id !== currentSnippet;
    });

    try {
        localStorage.setItem("xzenxosSnippets", JSON.stringify(snippets));
        newSnippet();
        refreshSnippetList();
        devPadStatus.textContent = "snippet deleted";
    } catch (error) {
        devPadStatus.textContent = "could not update browser storage";
    }
}

snippetList.addEventListener("change", function () {
    var selected = snippets.find(function (snippet) {
        return snippet.id === snippetList.value;
    });

    if (!selected) {
        newSnippet();
        return;
    }

    currentSnippet = selected.id;
    snippetTitle.value = selected.title;
    snippetCode.value = selected.code;
    devPadStatus.textContent = "snippet loaded";
});

loadSnippets();
dragWindow("devPadWindow");