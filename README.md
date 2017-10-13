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


Message types:

-----
from    : content
subject : ready
payload : undefined

Sent by the content script when the fathom scores are computed.  
Listener is the background script to cache the computed fathom scores.

-----
from    : sidebar           
subject : request_refresh
payload : undefined

Sent by the sidebar when the sidebar needs all the wishlist data for rendering.

-----
from    : sidebar           
subject : delete_data
payload : the JSON object to remove from the backing datastore

Sent by the sidebar when the sidebar needs the backend to remove an
entry in the wishlist dictionary

Sent when the sidebar needs all the wishlist data for rendering.

-----
from    : popup
subject : getDOMInfo
payload : undefined

Sent by the page_action DOM script when we want the background script
to emit a copy of the precomputed fathom scores for the currently
active page.

-----
from    : background
subject : duplicate_item
payload : undefined

Sent by the background script when a duplicate item is being added to
the wishlist.  Duplicates are filtered based on the URL that is being
saved.

---
from    : background
subject : add_item
payload : JSON blob of the item to be saved

Sent by the background script when a new item has been added to the
backing datastore.  Listeners should update their UI.

---
from    : background
subject : fathom_data
payload : JSON blob of the Fathom scores for the current page. 

Sent by the background script when the page action button is clicked. 

This message is usually picked up by the page action script so that
the popup can respond, and the message is then forwarded over to the
sidebar.

---
from    : pop_up
subject : save_product
payload : JSON blob of the Fathom scores for the current page. 

This message is a forwarded message from the background script with
the fathom scores for the current page.

The sidebar is the usual listener for this event.
