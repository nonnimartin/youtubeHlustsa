//Check localhost process status every half second
setInterval(checkProcessStatus, 500);
var processResponse = {};

function checkProcessStatus() {

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "http://localhost:3002/status.json", false);
   xhttp.send(null);
   var processResponse = JSON.parse(xhttp.responseText);
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
   //listen in background for updates to the current url, and change the url value each time if
   //url begins with prefix
   var prefix = "https://www.youtube.com/watch?v=";
   var url = tab.url;
   if (url.startsWith(prefix)) {
       currentTabUrl = url;
       localStorage.setItem("currentUrl", currentTabUrl);
   }
});

//Send most recent youtube URL to popup.js when requested
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log("Backround script listener received message type = " + message.type);
        switch(message.type) {
            case "getCurrentUrl":
        
                var currentUrl    = localStorage.getItem("currentUrl");
                currentJSON       = {'url' : currentUrl, 'statusJSON' : processResponse}

                sendResponse(currentJSON);
                break;
            default:
                console.error("Unrecognised message: ", message);
           }
        }
);
