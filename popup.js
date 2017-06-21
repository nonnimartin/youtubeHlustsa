function downloadContent(url, fileName) {
  chrome.downloads.download({
      url:      url,
    filename: fileName
  });
};

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, true );
    xmlHttp.send( null );
    return xmlHttp.responseText;
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

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "getVars"}, function(vars) {
            if (typeof vars == "undefined") {
                 if (chrome.runtime.lastError) {
                  console.log("Could not talk to script")
                 }
            }
            else {
              var url        = vars[0];
              var fileName   = vars[1];
              var argsString = ""

              //Get data from video url
              var vidData  = httpGet(url);
              var data = new ArrayBuffer(vidData);
              var int8View = new Int8Array(data);
              console.log(int8View.toString(8));
              //test = FileReaderJS.setupInput(vidData, {readAsDefault: 'ArrayBuffer'});
              
             //  var args = '-c copy -map 0:a output_audio.mp4'

             //  ffmpeg = ffmpeg_run({
             //      arguments: args,
             //      files: [
             //      {
             //        data: vidData,
             //        name: "audio.mp4"
             //      }
             //     ]
             //  });
             
             // console.log(ffmpeg)

            }
        })
    })
};



document.getElementById('getVid').addEventListener('click', getVid);
document.getElementById('getMp3').addEventListener('click', getMp3);

