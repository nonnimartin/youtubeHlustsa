//Check localhost process status every two seconds
setInterval(checkProcessStatus, 2000);

config = '{"server":"ec2-34-212-12-236.us-west-2.compute.amazonaws.com", "statusJsonPort":"3002", "downloadPort":"3001", "readyStatusPort":"3000", "vidsDownloadPort":"3003"}';

//read properties from file
configData = JSON.parse(config);

server           = configData.server;
statusJsonPort   = configData.statusJsonPort;
downloadPort     = configData.downloadPort;
readyStatusPort  = configData.readyStatusPort;
vidsDownloadPort = configData.vidsDownloadPort;

processing = false;

var processResponse;

function checkProcessStatus() {

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", 'http://' + server + ':' + statusJsonPort + '/status.json', false);
  xhttp.send(null);
  processResponse = JSON.parse(xhttp.responseText);
}

function getJobs() {
    //check jobs map in storage
    //like {'jobname.extension' : 'uuid'}
    return localStorage.getItem('jobsMap');
}

function removeJob(obj, uuid){
   for (key in obj) {
       if (obj[key] == uuid){
         delete obj[key];
         return obj;
       } 
   }
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function findNextJob(clientJobsList, serverJobsList){
  //return first client job uuid that's in server jobs list
  for (job in clientJobsList){
    var thisUuid = clientJobsList[job];
    if (thisUuid in serverJobsList) return thisUuid;
  }
  //if none match return false
  return false;
}

function processFileStatus() {

  var nextItem = localStorage.getItem('nextItem');

  //check if next job is stored, and set if not
  if (nextItem == null || nextItem == undefined){

    chrome.storage.sync.get(['jobsMap'], function(items) {

      var jobsString = items['jobsMap'];

      if (jobsString == undefined) return;

      var jobsObj    = JSON.parse(jobsString);

      //get the job based on the status from server
      var uuid = jobsObj[Object.keys(jobsObj)[0]];

      //process reponse variable works
      var thisJobRes     =  processResponse[uuid];
      var thisJobResObj  = thisJobRes;
      var status         = thisJobResObj['status'];
      var fileName       = thisJobResObj['fileName'];
      var fileType       = thisJobResObj.fileType;
      var fileType       = thisJobResObj.fileType;

      localStorage.setItem('nextItem', uuid);

      if (status == 'processing') {
        chrome.browserAction.setPopup({popup: "popupDisabledBoth.html"});
      }else if (status == 'done'){
        chrome.browserAction.setPopup({popup: "popup.html"});
      }
      return;
    });
  }

  //added status change to keep from downloading temporarily

  var nextItemUuid = localStorage.getItem('nextItem');

  //process reponse variable works
  var thisJobRes     =  processResponse[nextItemUuid];
  var thisJobResObj  = thisJobRes;
  var status         = thisJobResObj['status'];
  var fileName       = thisJobResObj['fileName'];
  var fileType       = thisJobResObj.fileType;
  var fileType       = thisJobResObj.fileType;

  if (status == 'processing') {
    chrome.browserAction.setPopup({popup: "popupDisabledBoth.html"});
  }else if (status == 'done'){
    chrome.browserAction.setPopup({popup: "popup.html"});
  }


  if (status == 'done') {
    if (fileType == 'mp3'){
      processing = true;
      chrome.downloads.download({url: "http://" + server + ":" + downloadPort + "/" + fileName + ".mp3", filename : fileName + '.mp3'});

      chrome.storage.sync.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
      });
      localStorage.removeItem('nextItem');
      processing = false;
    }
    else if (fileType == 'mp4'){
      processing = true;

      chrome.downloads.download({url: "http://" + server + ":" + vidsDownloadPort + "/" + fileName + ".mp4", filename : fileName + '.mp4'}, function(res){
        //add listener for download completion
        chrome.downloads.onChanged.addListener(function onChanged({state}) {
           if (state.current == "complete"){
              chrome.downloads.onChanged.removeListener(onChanged);
              deleteVidDownload("http://" + server + ":" + readyStatusPort + "/urls/delete_vid/", fileName + ".mp4");
           }
        });
        
      });
      chrome.storage.sync.clear(function() {
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
      });
      localStorage.removeItem('nextItem');
      processing = false;
    }

    return "done";
  }
  return;
  
}

  //listen for change in state of download
  function onChanged({state}) {
    if (state && state.current !== 'in_progress') {
      console.log('state current is = ' + state.current.toString());
      next();
    }
  }

function deleteVidDownload(endpoint, fileName){
    //send request to /delete_vid endpoint
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", endpoint, true);
    xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify({ "deleteFile" : fileName }));
    return;
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
        //console.log("Backround script listener received message type = " + message.type);
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
                //check process status every two seconds
                var processInterval = setInterval(function() {var status = processFileStatus(); if (status == "done") {clearInterval(processInterval);}}, 2000);
                break;
            default:
                console.error("Unrecognised message: ", message);
           }
        }
);
