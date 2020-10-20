var listToUse;
const DEFAULT_LIST = "https://adamantpenguin.github.io/snap_lib_list.json"; // this is the URL of the default list
const CORS_PROXY_URL = "https://cors-anywhere.herokuapp.com/"; // this is the URL of the CORS proxy endpoint to append the URLs to
const FALLBACK_LIST = { // this is the list to use if the default list couldn't be retrieved (e.g. i deleted it for some reason)
    "test": {
        "description": "Test library (doesn't exist) - from fallback",
        "url": "https://example.com/blocks.xml"
    }
};

async function init() {
    try {
        // get the list from internet
        var listObj = fetch(CORS_PROXY_URL + DEFAULT_LIST, {
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

    // buttons and stuff
    inbox = document.querySelector("#libName"); // input box
    inbox.addEventListener("input", updateInfo); // add event listener to input box (yes i know i shouldn't be using addEventListener)
    outtag = document.querySelector("#libInfo"); // italicised output area for the description
    importbut = document.querySelector("#importButton"); // button that imports
    importbut.addEventListener("click", importLib); // event listener for when you click the button
};

function updateInfo() {
    try {
        // set the description to the description of the entered library
        outtag.innerText = listToUse[inbox.value].description;
        importbut.disabled = false;
    }
    catch(e) {
        // the library probably doesn't exist if that errors, assume that is the case because lAzY
        outtag.innerText = "Library not found";
        importbut.disabled = true;
    }
};

async function importLib() {
    // import the library into Snap!
    var xmlGetter = fetch(CORS_PROXY_URL + listToUse[inbox.value].url, {
        cache: "no-cache" // same reason as above
    }).then(data => {return data});
    var xmlGot = await xmlGetter.then(data => {return data.text()}); // return text as a string because xml
    console.log("Downloaded library from " + listToUse[inbox.value].url);

    var execute = browser.tabs.executeScript({file: "../content/importer.js"}); // stick the code into snap
    await execute.then(result => {console.log("Injected script")}, error => {console.log(error)}); // actually do it this time, and log things for debugging
    var queryer = browser.tabs.query({currentWindow: true, active: true}); // get the active tab
    await queryer.then(tabs => {browser.tabs.sendMessage(tabs[0].id, { // send the things to the imported script
        "name": inbox.value,
        "xml": xmlGot
    })});
    window.close() // close the popup because it is not needed anymore
};

init(); // run the stuff (needed like this because async function)
