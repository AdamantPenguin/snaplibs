# snaplibs
Firefox extension and 'repository' (somewhat similar to APT) of community-maintained libraries for the graphical programming language Snap!

Although it is a WebExtension, it uses an API that is currently only in Firefox (unless I have misread 
[this article](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts))

## How it works
The extension adds a page action for the snap editor page, which when clicked opens a popup. It downloads the list of libraries from a json file somewhere
(will add where soon) and then while you type the name into the popup, it checks this list to see if it exists. Once you have typed the name of one that
does exist, it will show its metadata and enable the "import" button. Clicking the import button will download the library (the address is in the meta)
and import it into Snap!.

## To-do list
 - [ ] add a library browser to choose libraries graphically rather than by typing the name (see issue #1)
 - [ ] allow user to change the URL of the list of libraries

## Contributing
My code is an absolute mess: if you want to clean it up, PRs are welcome ;) Or you can make one for absolutely anything, I don't mind, but you might want to 
check with me first before you start.
