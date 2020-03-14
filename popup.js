var currentStatus = {};

//config = '{"server":"ec2-34-212-12-236.us-west-2.compute.amazonaws.com", "statusJsonPort":"3002", "downloadPort":"3001", "readyStatusPort":"3000", "vidsDownloadPort":"3003"}';
config = '{"server":"localhost", "statusJsonPort":"3002", "downloadPort":"3001", "readyStatusPort":"3000", "vidsDownloadPort":"3003"}';

//read properties from file
configData = JSON.parse(config);

server          = configData.server;
statusJsonPort  = configData.statusJsonPort;
downloadPort    = configData.downloadPort;
readyStatusPort = configData.readyStatusPort;

function clearBackup() {
  //set local node.js server api
  var clearBackupUrl = "http://" + server + ":" + '3000' + "/urls/clear_backups/";
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", clearBackupUrl, true);
  xmlHttp.setRequestHeader('Access-Control-Allow-Origin', '*');
  xmlHttp.send(null);
};

function postUrl(theUrl, fileName, youTubeUrl, isVideo, jobUuid) {
    
    var nodeServerUrl;
    var extension;
    console.log('client params = ');
    console.log(theUrl + ' ' + fileName + ' ' + youTubeUrl);

    //set local node.js server location
    if (isVideo){
      extension = 'mp4';
      nodeServerUrl = "http://" + server + ":" + readyStatusPort + "/urls/get_vid/";
    }else{
      extension = 'mp3';
      nodeServerUrl = "http://" + server + ":" + readyStatusPort + "/urls/get_file/";
    }
    //write url into JSON
    var fileName = fileName.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
    var urlData = {"url" : theUrl, "name" : fileName, "youTubeUrl" : youTubeUrl, "jobUuid" : jobUuid}
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", nodeServerUrl, true );
    xmlHttp.setRequestHeader('Content-type', 'application/json');
    xmlHttp.setRequestHeader('Access-Control-Allow-Origin', '*');

    xmlHttp.send(JSON.stringify(urlData));
}
  
function checkProcessStatus() {
    chrome.extension.sendMessage({type: "processStatus"}, function (statusJSON) {
      console.log("Sent process status message to background");
    });
}

function getMp3() {

    //disable getMp3 button to prevent double submission, this is handled in background for
    //other tabs
    document.getElementById('getMp3').disabled = true;

    //Get background script current url data here
    chrome.extension.sendMessage({type: "getCurrentUrl"}, function (response) {
            var currentUrl = response.url;
            currentStatus  = response.statusJSON;
    });
    //Ask for contentJSON data from content.js
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "getContentJSON"}, function(contentJSON) {
            var googleVidUrl = contentJSON["googleVidUrl"];
            var youTubeTitle = contentJSON["youTubeTitle"];
            var youTubeUrl   = contentJSON["youTubeUrl"];
            var jobUuid      = contentJSON["jobUuid"];

            console.log("youtubeUrl = " + youTubeUrl);
            console.log("Google video URL is " + googleVidUrl + "and title is " + youTubeTitle);

            //Send google video URL and filename to node.js server for processing
            postUrl(googleVidUrl, youTubeTitle, googleVidUrl, false, jobUuid);
            checkProcessStatus();
        });
    })
};

function getVid() {

    //disable getMp3 button to prevent double submission, this is handled in background for
    //other tabs
    document.getElementById('getVid').disabled = true;

    //Get background script current url data here
    chrome.extension.sendMessage({type: "getCurrentUrl"}, function (response) {
            var currentUrl = response.url;
            currentStatus  = response.statusJSON;
    });
    //Ask for contentJSON data from content.js
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "getContentJSONVid"}, function(contentJSON) {
            var googleVidUrl = contentJSON["googleVidUrl"];
            var youTubeTitle = contentJSON["youTubeTitle"];
            var youTubeUrl   = contentJSON["youTubeUrl"];
            var jobUuid      = contentJSON["jobUuid"];

            console.log("youtubeUrl = " + youTubeUrl);
            console.log("Google video URL is " + googleVidUrl + "and title is " + youTubeTitle);
            //Send google video URL and filename to node.js server for processing
            postUrl(googleVidUrl, youTubeTitle, googleVidUrl, true, jobUuid);
            checkProcessStatus();
        });
    })
};

document.getElementById('getVid').addEventListener('click', getVid);
document.getElementById('getMp3').addEventListener('click', getMp3);
document.getElementById('clearBackup').addEventListener('click', clearBackup);

