var listToUse;
const DEFAULT_LIST = "https://adamantpenguin.github.io/snap_lib_list.json"; // this is the URL of the default list
const FALLBACK_LIST = { // this is the list to use if the default list couldn't be retrieved (e.g. i deleted it for some reason)
    "test": {
        "description": "Test library (doesn't exist) - from fallback",
        "url": "https://example.com/blocks.xml"
    }
};

const LIBRARY_TABLE = document.querySelector("#libraryTable");
function addRowToTable(table, data) {
    var newRow = document.createElement("tr");
    for (var i=0; i<data.length; i++) {
        var newCell = document.createElement("td");
        newCell.innerHTML = data[i];
        newRow.append(newCell);
    };
    table.appendChild(newRow);
}

async function initList() {
    try {
        // get the list from internet
        var listObj = fetch(DEFAULT_LIST, {
            cache: "no-cache" // no cache because then problems happen
        }).then(data => {return data});
        listToUse = await listObj.then(data => {return data.json()}); // get the json from the response
        console.log("loaded from internet: " + listToUse);
    }
    catch(e) {
        // in case there was an error in fetch()
        listToUse = FALLBACK_LIST;
        console.log(e);
    };
    if (listToUse === undefined) {
        // in case the internet list was successful but didn't return (e.g. error 404)
        listToUse = FALLBACK_LIST;
        console.log("internet list was undefined");
    };
    console.log("using list " + listToUse);
};

async function importLib(libraryId) {
    // import the library into Snap!

    // check if it is hosted somewhere other than github (because extra permissions)
    if (listToUse[libraryId].url.match("\/\/raw\.githubusercontent\.com") === null) {
        if (confirm("The library " + libraryId + " is hosted somewhere I can't access. Grant extra permissions to access it?")) {
            await browser.permissions.request({ // ask for permission for that specific page
                origins: [listToUse[libraryId].url]
            }).then(result => {
                if (!result) {
                    alert("unable to import library due to no permissions")
                    return
                };
            });
        } else {
            alert("unable to import library due to no permissions")
            return
        };
    };

    // find the correct tab to inject into
    var querying = browser.tabs.query({url: "*://*/*/snap.html"});
    var tabId = await querying.then(tabs => {
        return tabs[0].id
    });

    var xmlGetter = fetch(listToUse[libraryId].url, {
        cache: "no-cache" // same reason as above
    }).catch(error => { // if it couldn't get the thing
        console.log(error);
        alert("unexpected error while downloading library :(");
    }).then(data => {return data});

    var xmlGot = await xmlGetter.then(data => {return data.text()}); // return text as a string because xml
    console.log("Downloaded library from " + listToUse[libraryId].url);

    var execute = browser.tabs.executeScript(tabId, {file: "../content/importer.js"}); // stick the code into snap
    await execute.then(result => {console.log("Injected script")}, error => {console.log(error)}); // actually do it this time, and log things for debugging
    var queryer = browser.tabs.query({currentWindow: true, active: true}); // get the active tab
    await queryer.then(tabs => {browser.tabs.sendMessage(tabId, { // send the things to the imported script
        "name": libraryId,
        "xml": xmlGot
    })});
    window.close() // close the popup because it is not needed anymore
};

function importLibFromButton() {
    importLib(this.dataset.libName);
};

async function initTable() {
    await initList(); // download index
    for (var p=0; p<Object.keys(listToUse).length; p++) { // for each library
        var currentKey = Object.keys(listToUse)[p]; // add the name

        // add the row with the fancy function
        addRowToTable(LIBRARY_TABLE, [currentKey, "<a target=\"_blank\" href=\"" + listToUse[currentKey].homepage + "\">" + listToUse[currentKey].author + "</a>", listToUse[currentKey].description, "<button class=\"importButton\" data-lib-name=\"" + currentKey + "\">Import</button>"]);
    };
    var importButtons = document.querySelectorAll(".importButton");
    for (var b=0; b<importButtons.length; b++) {
        importButtons[b].addEventListener("click", importLibFromButton)
    };
};
initTable();

function filterTable() {
    var searchBox = document.querySelector("#searchBox");
    var searchContent = searchBox.value.toUpperCase(); // uppercase for case insensitivity
    var table = LIBRARY_TABLE;
    var rows = table.querySelectorAll("tr")

    // iterate on the rows
    for (var r=0; r<rows.length; r++) {
        var descCell = rows[r].querySelectorAll("td")[2] // get the third cell (description)
        if (descCell) { // check if the cell actually exists
            console.dir(descCell)
            var value = descCell.innerText.toUpperCase(); // again uppercase for case insensitivity
            if (value.indexOf(searchContent) != -1) { // if it matches
                rows[r].style.display = ""; // show
            } else {
                rows[r].style.display = "none"; // hide
            };
        };
    };
};

document.querySelector("#searchBox").addEventListener("keyup", filterTable)