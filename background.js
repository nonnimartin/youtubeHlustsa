//Check localhost process status every half second
setInterval(checkProcessStatus, 500);

var processResponse;

function checkProcessStatus() {

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "http://localhost:3002/status.json", false);
  xhttp.send(null);
  processResponse = JSON.parse(xhttp.responseText);
}

function processFileStatus() {
  //process reponse variable works
  var responseStatus = processResponse;
  var status         = responseStatus.status;
  var fileName       = responseStatus.fileName;
  console.log(responseStatus);

  if (status == 'done') {
    chrome.downloads.download({url: 'http://localhost:3001/' + fileName + '.mp3', filename : fileName + '.mp3'});
    chrome.browserAction.setPopup({popup: "popup.html"});
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://localhost:3000/urls/ready_status", true);
    xhttp.send(null);
    return "done";
  }else if (status == 'processing') {
    chrome.browserAction.setPopup({popup: "popupDisabledMp3.html"});
  }else if (status == 'startup') {
    chrome.browserAction.setPopup({popup: "popup.html"});
  }

}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
   //listen in background for updates to the current url, and change the url value each time if
   //url begins with prefix
   var prefix  = "https://www.youtube.com/watch?v=";
   var url     = tab.url;

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

                currentJSON       = {
                  'url' : currentUrl, 
                  'statusJSON' : processResponse
                }

                sendResponse(currentJSON);
                break;
            case "processStatus":
                var processInterval = setInterval(function() {var status = processFileStatus(); if (status == "done") {clearInterval(processInterval);}}, 500);
                break;
            default:
                console.error("Unrecognised message: ", message);
           }
        }
);
