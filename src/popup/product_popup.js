// Update the relevant fields with the new data
function setDOMInfo(info) {
  document.getElementById('title').innerHTML = info.title;
  document.getElementById('image').src  = info.image;
  document.getElementById('price').textContent = "$" + info.price;
}

// Once the DOM is ready...
window.addEventListener('DOMContentLoaded', function () {
  // ...query for the active tab...
  browser.tabs.query({
    active: true,
    currentWindow: true
  }, function (tabs) {
    // ...and send a request for the DOM info...
    browser.tabs.sendMessage(
        tabs[0].id,
        {from: 'popup', subject: 'DOMInfo'},
        setDOMInfo);
  });
});
