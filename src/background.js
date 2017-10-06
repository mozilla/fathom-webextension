// Store all the Fathom info for each tab
//
//

/* generic error handler */
function onError(error) {
    console.log(error);
}

function initialize() {
    var gettingAllStorageItems = browser.storage.local.get(null);
    gettingAllStorageItems.then((results) => {
        console.log("Fetched results from local storage!");
        var noteKeys = Object.keys(results);
        for (let noteKey of noteKeys) {
            var curValue = results[noteKey];
            console.log(`URL: ${noteKey}\n\tObj: ${JSON.stringify(curValue)}`);
            WISHLIST.addItem(curValue);
        }
    }, onError);
}

class WishlistItem {
    constructor(title, description, price, url, image_url) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.url = url;
        this.image_url = image_url;
    }

    getTitle() {
        return this.title;
    }

    getDescription() {
        return this.description;
    }

    getPrice() {
        return this.price;
    }

    getUrl() {
        return this.url;
    }

    getImageUrl() {
        return this.image_url;
    }

    toJSON() {
        return JSON.stringify({title: this.title,
            description: this.description,
            price: this.price,
            url: this.url,
            image: this.image_url});
    }

}


class WishlistStore {
    constructor() {
        // The wishlist just acts as a container to store wishlist
        // items
        this.state = {items: []};
    }

    addItem(item) {
        // TODO: persist this into local storage
        for (let temp_item of this.state.items) {
            if (temp_item.url === item.url) {
                browser.runtime.sendMessage({'from': 'background',
                    'subject': 'duplicate_item'});
                return;
            }
        }
        this.state.items.push(item);
        
        // send a message that an item has been added
        browser.runtime.sendMessage({'from': 'background',
            'subject': 'added_item',
            'payload': item.toJSON()});
    }

    // Remove item at index.  Returns item removed or null if no item
    // was removed.
    removeItem(i) {
        if (i < 0 || i >= this.state.items.length) {
            return;
        }
        var result = this.state.items[i];
        this.state.splice(i, 1);
        return result;
    }

    // Make JSON stringified copy of the array
    getItems() {
        return this.state.items.slice();
    }

}

var WISHLIST = new WishlistStore();
var FATHOM_TAB_INFO = {};


// TODO Move this into a registerListeners function
browser.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (FATHOM_TAB_INFO[tabId] !== undefined) {
    console.log(`Removing tabID: ${tabId}`);
    delete FATHOM_TAB_INFO[tabId];
  }
});

/*
 * The background script receives a number of messages.
 *
 * These are:
 *
 * 1. Sidebar has been made visible.  
 *   The intent of this is to signal that the background script should
 *   send a copy of all the fathom computed scores to the sidebar.
 *
 * 2. Page score is computed
 *
 * When the document_idle event is triggered, the content script will
 * compute the fathom score info and pass it back to the background
 * script for caching.
 *
 * 3. Page action is clicked
 *
 * This should signal the background script to *copy* the cached
 * fathom scores for the current visible tab and put them into another 
 * list which is used as the backing datastore for the wishlist.
 *
 * 4. TODO: some kind of signal to notify the background script that
 * data has been updated manually through editting.
 *
 */
// TODO Move this into a registerListeners function
browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // First, validate the message's structure
    if ((msg.from === 'content') && (msg.subject === 'ready')) {
        // Enable the page-action for the requesting tab
        // PageActions are disabled by default
        // Showing a page action means "show the icon", not "open the popup"
        browser.pageAction.show(sender.tab.id);

        // Save fathom scores into FATHOM_TAB_INFO
        console.log(`Received fathom data: ${JSON.stringify(msg.scores)}`);
        FATHOM_TAB_INFO[sender.tab.id] = msg.scores;
        console.log(`Added score info ${JSON.stringify(msg.scores)}`);
    } else if ((msg.from === 'popup') && (msg.subject === 'getDOMInfo')) {
        console.log("Got message from popup for getDOMInfo");
        function onTabInfo(tabs) {
            for (let tab of tabs) {
                // tab.url requires the `tabs` permission
                let tabId = tab.id;
                let resultData = FATHOM_TAB_INFO[tabId];
                console.log(`Sending data back to popup: ${JSON.stringify(resultData)}`);

                // Note that we can't use the sendResponse function to send back data.
                // No idea why this happens, but the promise in the pageAction popup
                // doesn't seem to get payload we pass into sendResponse.
                browser.runtime.sendMessage({'from': 'background',
                    'subject': 'fathom_data',
                    'payload': resultData});

            }
        }

        // Get the currently selected tab 
        var selected_tab_promise = browser.tabs.query({currentWindow: true, active: true});
        // With the selected tab, we want to use onTabInfo to send the
            // fathom data over the browser messaging bus
        selected_tab_promise.then(onTabInfo, onError);
    } else if ((msg.from === 'popup') && (msg.subject === 'save_product')) {
        // This is a product we want to save.  Append it to the
        // wishlist
        let payload = msg.payload;
        let key = payload.url;

        let storage_payload = {};
        storage_payload[key] = payload;

        let setting = browser.storage.local.set(storage_payload);
        console.log(`Saving item to disk! ${JSON.stringify(storage_payload)}`)
        setting.then(function() {
            console.log(`Saved item to disk! ${JSON.stringify(storage_payload)}`)
            let item = new WishlistItem(payload.title,
                payload.title,
                payload.price,
                payload.url,
                payload.image);

            WISHLIST.addItem(item);
        }, onError);
    } else if ((msg.from === 'sidebar') && (msg.subject === 'deleted')) {
        WISHLIST.removeItem(msg.payload);
    }
});

initialize();
