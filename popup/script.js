var listToUse;
const DEFAULT_LIST = "https://adamantpenguin.github.io/snap_lib_list.json"; // this is the URL of the default list
const FALLBACK_LIST = { // this is the list to use if the default list couldn't be retrieved (e.g. i deleted it for some reason)
    "test": {
        "description": "Test library (doesn't exist) - from fallback",
        "url": "https://example.com/blocks.xml"
    }
};

async function init() {
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
        alert("Couldn't fetch the package index");
        console.log(e);
    };
    if (listToUse === undefined) {
        // in case the internet list was successful but didn't return (e.g. error 404)
        listToUse = FALLBACK_LIST;
        alert("Couldn't fetch the package index");
        console.log("internet list was undefined");
    };
    console.log("using list " + listToUse);

    // buttons and stuff
    inbox = document.querySelector("#libName"); // input box
    inbox.addEventListener("input", updateInfo); // add event listener to input box (yes i know i shouldn't be using addEventListener)
    outtag = document.querySelector("#libInfo"); // italicised output area for the description
    authhref = document.querySelector("#libAuthorHref"); // <a> tag for the author field
    authtag = document.querySelector("#libAuthor"); // italics bit for the author field
    importbut = document.querySelector("#importButton"); // button that imports
    importbut.addEventListener("click", importLib); // event listener for when you click the button
    choosebut = document.querySelector("#chooserButton"); // the button that opens the library chooser
    choosebut.addEventListener("click", useChooser)
};

function updateInfo() {
    try {
        // set the description and author to that of the entered library
        outtag.innerText = listToUse[inbox.value].description;
        authtag.innerText = listToUse[inbox.value].author;
        authhref.href = listToUse[inbox.value].homepage;

        importbut.disabled = false;
    }
    catch(e) {
        // the library probably doesn't exist if that errors, assume that is the case because lAzY
        outtag.innerText = "Library not found";
        authtag.innerText = "N/A";
        authhref.removeAttribute("href"); // no more link

        importbut.disabled = true;
    }
};

async function importLib() {
    // import the library into Snap!

    // check if it is hosted somewhere other than github (because extra permissions)
    if (listToUse[inbox.value].url.match("\/\/raw\.githubusercontent\.com") === null) {
        if (confirm("The library " + inbox.value + " is hosted somewhere I can't access. Grant extra permissions to access it?")) {
            await browser.permissions.request({ // ask for permission for that specific page
                origins: [listToUse[inbox.value].url]
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

    var xmlGetter = fetch(listToUse[inbox.value].url, {
        cache: "no-cache" // same reason as above
    }).catch(error => { // if it couldn't get the thing
        console.log(error);
        alert("unexpected error while downloading library :(");
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

async function useChooser() {
    // open the library chooser
    var chooserWindow = await browser.windows.create({
        url: "libraries.html",
        type: "popup",
        state: "normal"
    });
}

init(); // run the stuff (needs to be like this because of init() being async function)
