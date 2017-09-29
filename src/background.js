// Store all the Fathom info for each tab
var fathomTabInfo = {};

browser.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (fathomTabInfo[tabId] !== undefined) {
    console.log(`Removing tabID: ${tabId}`);
    delete fathomTabInfo[tabId];
  }
});

browser.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // First, validate the message's structure
    if ((msg.from === 'content') && (msg.subject === 'ready')) {
        // Enable the page-action for the requesting tab
        // PageActions are disabled by default
        // Showing a page action means "show the icon", not "open the popup"
        browser.pageAction.show(sender.tab.id);

        // Save fathom scores into fathomTabInfo
        fathomTabInfo[sender.tab.id] = msg.scores;
        console.log(`Added score info ${JSON.stringify(msg.scores)}`);
    } else if ((msg.from === 'popup') && (msg.subject === 'DOMInfo')) {
        console.log("Got message from popup for DOMInfo");
        function onGot(tabs) {
            for (let tab of tabs) {
                // tab.url requires the `tabs` permission
                let tabId = tab.id;
                let resultData = fathomTabInfo[tabId];
                console.log(`Sending data back to popup: ${JSON.stringify(resultData)}`);

                // Note that we can't use the sendResponse function to send back data.
                // No idea why this happens, but the promise in the pageAction popup
                // doesn't seem to get payload we pass into sendResponse.
                browser.runtime.sendMessage({'from': 'background',
                    'subject': 'fathom_data',
                    'payload': resultData});

            }
        }
        function onError(error) {
            console.log(`Error: ${error}`);
        }
        var querying = browser.tabs.query({currentWindow: true, active: true});
        querying.then(onGot, onError);
    }
});
