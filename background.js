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

chrome.runtime.onMessage.addListener(
function(message, sender, sendResponse) {
    console.log("Received message type = " + message.type)
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

//Ask background script to send most recent youtube full url as message
// chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {        
//    if (changeInfo.status == 'complete') {
//       var currentUrl = localStorage.getItem("currentUrl");
//       var urlJSON    = {url : currentUrl, type : "sendCurrentURL"}
//       console.log(typeof urlJSON);
//       console.log(currentUrl);
//       chrome.tabs.getSelected(null, function(tab) {
//           chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
//               chrome.tabs.sendMessage(tabs[0].id, urlJSON, function(response) {});
//             }
//         )}
//     )}
// });