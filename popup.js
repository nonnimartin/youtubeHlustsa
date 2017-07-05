var currentStatus = {};

function downloadContent(url, fileName) {
  console.log(url)
  chrome.downloads.download({
      url:      url,
    filename: fileName
  });
};

function postUrl(theUrl, fileName) {

    //set local node.js server location

    nodeServerUrl = "http://localhost:3000/urls/get_file/"

    //write url into JSON

    console.log("===========");
    console.log("")
    console.log("writing url data");
    console.log("===========")
    var urlData = {"url" : theUrl, "name" : fileName }
    console.log(urlData["name"])
    console.log("Data content = " + JSON.stringify(urlData))
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "POST", nodeServerUrl, true );
    xmlHttp.setRequestHeader('Content-type', 'application/json');
    xmlHttp.send(JSON.stringify(urlData));
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
              var url      = vars[0];
              var fileName = vars[1];

              downloadContent(url, fileName + '.mp4');
            }
        })
    })
};

function getMp3() {

    //Get background script current url data here
    chrome.extension.sendMessage({type: "getCurrentUrl"}, function (response) {
            var currentUrl = response.url;
            currentStatus = response.statusJSON;
    });
    //Ask for contentJSON data from content.js
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "getContentJSON"}, function(contentJSON) {
            var googleVidUrl = contentJSON["googleVidUrl"];
            var youTubeTitle = contentJSON["youTubeTitle"];
            console.log("Google video URL is " + googleVidUrl + "and title is " + youTubeTitle);
            //Send google video URL and filename to local node.js server for processing
            postUrl(googleVidUrl, youTubeTitle);
        });
    });
};

document.getElementById('getVid').addEventListener('click', getVid);
document.getElementById('getMp3').addEventListener('click', getMp3);

