var libName, libXml // make it Global™

function importLib(message) {
    libName = message["name"]; // receive values from extension
    libXml = message["xml"];
        
    // import it
    var aFile = new File(
            [libXml], libName, {type: "text/xml",} // turn the XML into a file object
        );
    
    var frd = new FileReader(); // new file reader
    var target = wrappedJSObject.world.children[0]; // Morphic.js stuff (sorry about wrappedJSObject)
    frd.onloadend = (e) => { // once the file is loaded in the file reader
        target.droppedText(e.target.result, aFile.name, aFile.type); // drop it into the snap window (more Morphic nonsense here)
        console.log("imported library " + libName);
    };
    frd.readAsText(aFile); // idk what this is i just copied this section from the snap source code

};

browser.runtime.onMessage.addListener(importLib); // receive things