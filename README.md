# fathom-webextension

Simple popup that extracts and displays the product title, image, and
price when run on product detail pages (one main product). Uses
fathom-products rulesets
(https://github.com/swathiiyer2/fathom-products). Fathom-products uses
a Mozilla Javascript framework called Fathom
(https://github.com/mozilla/fathom). 

## Usage

Go to about:debugging in Firefox. In the add-ons tab, click 'Load
Temporary Extension', and choose any file in this repo. Visit any
product detail page and click the popup to see it's details!


## Limitations

This implements a sidebar action, and a page action.

The sidebar action is the popout sidebar in Firefox.  You can see the
list of currently added wishlist items 

The sidebar is used to look at the list of items that have been added to the wishlist.

Note that the sidebar *cannot* be opened programmatically with the WebExtension API.

https://developer.mozilla.org/en-US/Add-ons/WebExtensions/user_interface/Sidebars
```
Note that it's not possible for extension to open sidebars programmatically:
sidebars can only be opened by the user.
```


## Design docs

All the data is stored in the background.js script.  

This is all stored in a class `WishlistStore`
