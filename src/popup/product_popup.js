// Update the relevant fields with the new data
function setFathomInfo(info) {
  document.getElementById('title').innerHTML = info.title;
  document.getElementById('image').src  = info.image;
  document.getElementById('price').textContent = "$" + info.price;
}

browser.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if ((msg.from === 'background') && (msg.subject === 'fathom_data')) {
      browser.runtime.sendMessage({from: 'popup', subject: 'save_product', payload: msg.payload});
  } else if ((msg.from === 'background') && (msg.subject === 'product_saved')) {
      // Set the state on successful state change in backing datastore
      document.getElementById('save_state').innerHTML = 'Saved!';
  }
});

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {
  // ...query for the active tab...
  browser.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    // send a request for the DOM info...
    browser.runtime.sendMessage({from: 'popup', subject: 'getDOMInfo'});
  });
});
