$(document).ready(function () {

function checkLocation() {
    var pathname        = window.location;
    console.log('path name = ' + pathname);
    localStorage.setItem("googleVidUrl", pathname);
    localStorage.setItem("youTubeTitle", document.title.replace(/\s+/g, ''))
    localStorage.setItem("youTubeUrl", pathname);
}

function getJobs() {
    //check jobs map in storage
    //like {'jobname.extension' : 'uuid'}
    return localStorage.getItem('jobsMap');
}

function createJob(title, extension){

    //get current jobs map
    var jobsMap = new Object();
    var thisKey = title + '.' + extension;
    
    var uuid = uuidv4();
    jobsMap[thisKey] = uuid;
    stringObj = JSON.stringify(jobsMap);
    localStorage.setItem('jobsMap', stringObj);
    return uuid;
}

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

//check for page change every few seconds and update location information
setInterval(checkLocation, 300);

    //listen for contentJSON request from popup.js
    chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log("Content script listener received message type = " + message.type);
        switch(message.type) {
            case "getContentJSON":

                var googleVidUrl   = localStorage.getItem("googleVidUrl");
                var youTubeTitle   = localStorage.getItem("youTubeTitle");
                var youTubeUrl     = localStorage.getItem("youTubeUrl");


                //create job
                var uuid = createJob(youTubeTitle, 'mp3');
                
                //handling job uuid
                var jobTitle       = youTubeTitle + '.mp3';

                contentJSON = { "googleVidUrl" : googleVidUrl,
                                "youTubeTitle" : youTubeTitle,
                                "youTubeUrl"   : youTubeUrl,
                                "jobUuid"      : uuid
                }
                
                chrome.storage.sync.set({'jobsMap' : localStorage.getItem('jobsMap')}, function() {
                  console.log('Settings are saved');
                });

                console.log('getContentJSON content json = ' + JSON.stringify(contentJSON));
                
                sendResponse(contentJSON);
                break;

            case "getContentJSONVid":

                var googleVidUrl   = localStorage.getItem("googleVidUrl");
                var youTubeTitle   = localStorage.getItem("youTubeTitle");
                var youTubeUrl     = localStorage.getItem("youTubeUrl");

                //create job
                var uuid = createJob(youTubeTitle, 'mp4');

                //handling job uuid
                var jobTitle       = youTubeTitle + '.mp4';

                contentJSON = { "googleVidUrl" : googleVidUrl,
                                "youTubeTitle" : youTubeTitle,
                                "youTubeUrl"   : youTubeUrl,
                                "jobUuid"      : uuid
                }

                chrome.storage.sync.set({'jobsMap' : localStorage.getItem('jobsMap')}, function() {
                   console.log('Settings saved');
                });
                sendResponse(contentJSON);
                break;
            case "getVars":
                //get variables for video file location
                var currentUrl    = localStorage.getItem("googleVidUrl");
                var currentTitle  = localStorage.getItem("youTubeTitle");

                currentJSON       = {
                  'url'   : currentUrl,
                  'title' : currentTitle
                }
                console.log('getVars current json = ' + JSON.stringify(currentJSON));
                sendResponse(currentJSON);
                break;
            default:
                console.error("Unrecognised message: ", message);
           }
        }
    );
});

