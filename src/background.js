browser.runtime.onMessage.addListener(function (msg, sender) {
  // First, validate the message's structure
  if ((msg.from === 'content') && (msg.subject === 'showPageAction')) {
    // Enable the page-action for the requesting tab
    browser.pageAction.show(sender.tab.id);
  }
});

function handleClick() {
  console.log("page action was clicked");
}

browser.pageAction.onClicked.addListener(handleClick);
