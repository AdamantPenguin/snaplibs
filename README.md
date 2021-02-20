# snaplibs
Firefox extension and default repository of community-maintained libraries for the graphical programming language [Snap!](https://snap.berkeley.edu)

Although it is a WebExtension, it uses an API that is currently only in Firefox (unless I have misread 
[this page](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts))

## How it works currently
The extension adds a page action for the snap editor page, which when clicked opens a popup. It downloads the list of libraries from a json file somewhere
(where?) and then while you type the name into the popup, it checks this list to see if it exists. Once you have typed the name of one that
does exist, it will show its metadata and enable the "import" button. Clicking the import button will download the library (the address is in the meta)
and import it into Snap! via the drag and drop handler.

## To-do list
 - [ ] allow dependencies (VERY IMPORTANT) and other useful metadata
 - [ ] add a browser to choose packages graphically rather than by typing the name (see issue #1)
 - [ ] create a GitHub Pages site for sharing/download links, and also put default lists and packages somewhere (new repo?)
 - [ ] allow user to add extra repositories

## Contributing
My code is an absolute mess, if you want to clean it up, PRs are welcome ;) also once I move the default index here, feel free to add your packages
