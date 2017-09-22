// Store all the Fathom info for each tab
var fathomTabInfo = {};

browser.tabs.onRemoved.addListener(function(tabId, removeInfo) {
  if (fathomTabInfo[tabId] !== undefined) {
    console.log(`Removing tabID: ${tabId}`);
    delete fathomTabInfo[tabId];
  }
});

browser.runtime.onMessage.addListener(function (msg, sender) {
  // First, validate the message's structure
  if ((msg.from === 'content') && (msg.subject === 'ready')) {
    // Enable the page-action for the requesting tab
    // PageActions are disabled by default
    // Showing a page action means "show the icon", not "open the popup"
    browser.pageAction.show(sender.tab.id);

    // Save fathom scores into fathomTabInfo
    fathomTabInfo[sender.tab.id] = msg.scores;
    console.log(`Added score info ${JSON.stringify(msg.scores)}`);
  }
});

function handleClick() {
  console.log("page action was clicked");
}

browser.pageAction.onClicked.addListener(handleClick);
