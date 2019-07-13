//Check localhost process status every second
setInterval(checkProcessStatus, 1000);

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
  console.log(xhttp.responseText);
  processResponse = JSON.parse(xhttp.responseText);
}

function getJobs() {
    //check jobs map in storage
    //like {'jobname.extension' : 'uuid'}
    return localStorage.getItem('jobsMap');
}

//these methods may be unnecessary and handled in the content file
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function removeJob(obj, fileName){
   delete obj[fileName];
   return obj;
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
    console.log('trying to match ' + thisUuid.toString() + ' ' + 'in ' + JSON.stringify(serverJobsList));
    if (thisUuid in serverJobsList) return thisUuid;
  }
  //if none match return false
  return false;
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function processFileStatus() {
  
  var jobsString;
  console.log('got to beginning of process file status');

  // Read it using the storage API
  chrome.storage.sync.get(['jobsMap'], function(items) {

    jobsString     = items['jobsMap'];
    var jobsArray  = JSON.parse(jobsString);

    console.log('jobsArray = ' + JSON.stringify(jobsArray));

    if (jobsArray == undefined) return;
    console.log('got past array');
    if (jobsArray.length == 0)  return;
    console.log('got past 0');
    if (processing)             return;
    console.log('got past processing');
    //get the first job in array
    console.log('about to find next jorb');
    var uuid = findNextJob(jobsArray, processResponse);

    //if no next job matches, return
    if (!uuid){
      console.log('no job matches this time, returning');
      return;
    }
    console.log('jobs array = ' + JSON.stringify(uuid));
    console.log('jobs array = ' + JSON.stringify(processResponse));
    console.log('uuid = ' + uuid);

    //process reponse variable works
    var thisJobRes     =  processResponse[uuid];
    console.log('this job res = ' + thisJobRes);
    var thisJobResObj  = thisJobRes;
    var status         = thisJobResObj['status'];
    var fileName       = thisJobResObj['fileName'];
    var fileType       = thisJobResObj.fileType;
    var fileType       = thisJobResObj.fileType;
    console.log('job status = ' + status);
    

    //added status change to keep from downloading temporarily
    if (status == 'done') {
      if (fileType == 'mp3'){
        console.log('downloading mp3');
        processing = true;
        chrome.downloads.download({url: "http://" + server + ":" + downloadPort + "/" + fileName + ".mp3", filename : fileName + '.mp3'});
        var newObj = new Object();
        newObj = removeJob(items['jobsMap'], fileName);
        //update storage to remove downloaded item
        chrome.storage.sync.set(newObj, function() {
          //remove entry from object list in storage and loop
          console.log('Settings saved in background');
        });
        processing = false;
      }
      else if (fileType == 'mp4'){
        console.log('downloading mp4');
        processing = true;
        chrome.downloads.download({url: "http://" + server + ":" + vidsDownloadPort + "/" + fileName + ".mp4", filename : fileName + '.mp4'});
        var newObj = new Object();
        newObj = removeJob(items['jobsMap'], fileName);
        //update storage to remove downloaded item
        chrome.storage.sync.set(newObj, function() {
          //remove entry from object list in storage and loop
          console.log('Settings saved in background');
        });
        processing = false;
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
    

  });

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
