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

function getJobs() {
    //check jobs map in storage
    //like {'jobname.extension' : 'uuid'}
    return localStorage.getItem('jobsMap');
}

//these methods may be unnecessary and handled in the content file
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function removeJob(obj, uuid){
   //flip object to map uuids to titles and remove job by uuid
   var revObj = objectFlip(obj);
   delete revObj.uuid;
   return objectFlip(revObj);
}

function objectFlip(obj) {
  //reverse mapping in js object
  const flipped = {};
  Object.keys(obj).forEach((key) => {
    ret[obj[key]] = key;
  });
  return flipped;
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function processFileStatus() {
  //process reponse variable works
  var responseStatus = processResponse;
  var status         = responseStatus.status;
  var fileName       = responseStatus.fileName;
  var fileType       = responseStatus.fileType;
  var fileType       = responseStatus.fileType;
  
  //get jobs map from browser storage
  var jobsMap  = getJobs();
  var jobsObj  = JSON.parse(jobsMap);

  //ADD JOB HANDLING HERE FROM SERVER STATUS

  //added status change to keep from downloading temporarily
  if (status == 'doneXXX') {
    if (fileType == 'mp3'){
      chrome.downloads.download({url: "http://" + server + ":" + downloadPort + "/" + fileName + ".mp3", filename : fileName + '.mp3'});
    }
    else if (fileType == 'mp4'){
      chrome.downloads.download({url: "http://" + server + ":" + vidsDownloadPort + "/" + fileName + ".mp4", filename : fileName + '.mp4'});
    }
    
    chrome.browserAction.setPopup({popup: "popup.html"});
    var xhttp = new XMLHttpRequest();
    xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhttp.open("GET", "http://" + server + ":" + readyStatusPort + "/urls/ready_status", true);
    xhttp.send(null);
    return "done";
  }else if (status == 'processing' && fileType == 'mp3') {
    chrome.browserAction.setPopup({popup: "popupDisabledMp3.html"});
  }
  else if (status == 'processing' && fileType == 'mp4'){
    chrome.browserAction.setPopup({popup: "popupDisabledMp4.html"});
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
