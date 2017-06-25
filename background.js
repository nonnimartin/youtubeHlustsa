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

//Ask background script to send most recent youtube URL
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log("Backround script listener received message type = " + message.type);
        switch(message.type) {
            case "getCurrentUrl":
        
                var currentUrl    = localStorage.getItem("currentUrl");
                currentJSON       = {'url' : currentUrl}

                sendResponse(currentJSON);
                break;
            default:
                console.error("Unrecognised message: ", message);
           }
        }
);

