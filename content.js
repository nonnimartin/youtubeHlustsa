$(document).ready(function () {

function checkLocation() {
    var pathname        = window.location;
    var youtubeId       = pathname.toString().split("watch?v=")[1]

    YoutubeVideo(youtubeId, function(video){
        mp4 = video.getSource("video/mp4", "medium");
        localStorage.setItem("googleVidUrl", mp4.url);
        localStorage.setItem("youTubeTitle",   document.title.replace(/\s+/g, ''))
        localStorage.setItem("youTubeUrl", pathname);
    });

     // Save it using the Chrome extension storage API.
    chrome.storage.sync.set({'jobsMap' : localStorage.getItem('jobsMap')}, function() {
      console.log('Settings saved');
    });
}

function getJobs() {
    //check jobs map in storage
    //like {'jobname.extension' : 'uuid'}
    return localStorage.getItem('jobsMap');
}

function createJob(title, extension){

    //get current jobs map
    var jobsMap = getJobs();
    var thisKey = title + '.' + extension;
    var mapObj;
    
    if (jobsMap == null || jobsMap == 'null'){
        mapObj = new Object();
    }else{
        mapObj = JSON.parse(jobsMap);
    }
    
    if (thisKey in mapObj){
        console.log('duplicate job');
      return;
    }else{
      var uuid = uuidv4();
      mapObj[thisKey] = uuid;
      stringObj = JSON.stringify(mapObj);
      localStorage.setItem('jobsMap', stringObj);
    }
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
                createJob(youTubeTitle, 'mp3');
                
                //handling job uuid
                var jobsJson       = getJobs();
                var jobsMap        = JSON.parse(jobsJson);
                var jobTitle       = youTubeTitle + '.mp3';
                var jobUuid        = jobsMap[jobTitle];
                console.log('mp3 job uuid = ' + jobUuid);

                contentJSON = { "googleVidUrl" : googleVidUrl,
                                "youTubeTitle" : youTubeTitle,
                                "youTubeUrl"   : youTubeUrl,
                                "jobUuid"      : jobUuid
                }

                createJob(youTubeTitle, 'mp3');

                console.log('getContentJSON content json = ' + JSON.stringify(contentJSON));

                sendResponse(contentJSON);
                break;

            case "getContentJSONVid":

                var googleVidUrl   = localStorage.getItem("googleVidUrl");
                var youTubeTitle   = localStorage.getItem("youTubeTitle");
                var youTubeUrl     = localStorage.getItem("youTubeUrl");

                //create job
                createJob(youTubeTitle, 'mp4');

                //handling job uuid
                var jobsJson       = getJobs();
                var jobsMap        = JSON.parse(jobsJson);
                var jobTitle       = youTubeTitle + '.mp4';
                var jobUuid        = jobsMap[jobTitle];
                console.log('vid job uuid = ' + jobUuid);

                createJob(youTubeTitle, 'mp4');

                contentJSON = { "googleVidUrl" : googleVidUrl,
                                "youTubeTitle" : youTubeTitle,
                                "youTubeUrl"   : youTubeUrl,
                                "jobUuid"      : jobUuid
                }

                console.log('getContentJSON content json = ' + JSON.stringify(contentJSON));

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

