var currentStatus = {};

function downloadContent(url, fileName) {
  console.log('filename = ' + fileName);
  chrome.downloads.download({
      url:      url,
    filename: fileName
  });
};

function clearBackup() {
  //set local node.js server api
  var clearBackupUrl = "http://ec2-34-212-12-236.us-west-2.compute.amazonaws.com:3000/urls/clear_backups/"
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", clearBackupUrl, true);
  xmlHttp.send(null);
};

function postUrl(theUrl, fileName, youTubeUrl) {

    //set local node.js server location
    nodeServerUrl = "http://ec2-34-212-12-236.us-west-2.compute.amazonaws.com:3000/urls/get_file/"
    //write url into JSON
    var fileName = fileName.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
    var urlData = {"url" : theUrl, "name" : fileName, "youTubeUrl" : youTubeUrl}
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", nodeServerUrl, true );
    xmlHttp.setRequestHeader('Content-type', 'application/json');
    xmlHttp.send(JSON.stringify(urlData));
    console.log(JSON.stringify(urlData));
}
  
function checkProcessStatus() {
    chrome.extension.sendMessage({type: "processStatus"}, function (statusJSON) {
      console.log("Sent process status message to background");
    });
}

function getVid() {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "getVars"}, function(vars) {
            if (typeof vars == "undefined") {
                 if (chrome.runtime.lastError) {
                  console.log("Could not talk to script")
                 }
            }
            else {
              console.log("vars = " + Object.keys(vars));
              var url      = vars["url"];
              var fileName = vars["title"]; 

              console.log("url = " + url);
              console.log("title = " + fileName);
              var fileName = fileName.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase();
              downloadContent(url, fileName + '.mp4');
            }
        })
    })
};

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
            console.log("youtubeUrl = " + youTubeUrl);
            console.log("Google video URL is " + googleVidUrl + "and title is " + youTubeTitle);
            //Send google video URL and filename to local node.js server for processing
            postUrl(googleVidUrl, youTubeTitle, youTubeUrl);
            console.log(checkProcessStatus());
        });
    })
};

document.getElementById('getVid').addEventListener('click', getVid);
document.getElementById('getMp3').addEventListener('click', getMp3);
document.getElementById('clearBackup').addEventListener('click', clearBackup);

