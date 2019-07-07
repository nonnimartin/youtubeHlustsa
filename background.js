//Check localhost process status every half second
setInterval(checkProcessStatus, 500);

config = '{"server":"ec2-34-212-12-236.us-west-2.compute.amazonaws.com", "statusJsonPort":"3002", "downloadPort":"3001", "readyStatusPort":"3000", "vidsDownloadPort":"3003"}';

//read properties from file
configData = JSON.parse(config);

server           = configData.server;
statusJsonPort   = configData.statusJsonPort;
downloadPort     = configData.downloadPort;
readyStatusPort  = configData.readyStatusPort;
vidsDownloadPort = configData.vidsDownloadPort;

var processResponse;

function checkProcessStatus() {

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", 'http://' + server + ':' + statusJsonPort + '/status.json', false);
  xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
  xhttp.send(null);
  processResponse = JSON.parse(xhttp.responseText);
}

function processFileStatus() {
  //process reponse variable works
  var responseStatus = processResponse;
  var status         = responseStatus.status;
  var fileName       = responseStatus.fileName;
  var fileType       = responseStatus.fileType;
  console.log(responseStatus);

  if (status == 'done') {
    if (fileType == 'mp3'){
      chrome.downloads.download({url: "http://" + server + ":" + downloadPort + "/" + fileName + ".mp3", filename : fileName + '.mp3'});
    }
    else if (fileType == 'mp4'){
      chrome.downloads.download({url: "http://" + server + ":" + vidsDownloadPort + "/" + fileName + ".mp4", filename : fileName + '.mp4'});
    }
    
    chrome.browserAction.setPopup({popup: "popup.html"});
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", "http://" + server + ":" + readyStatusPort + "/urls/ready_status", true);
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
