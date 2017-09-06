$(document).ready(function () {


    function checkLocation() {
        var pathname   = window.location;
        var youtubeId  = pathname.toString().split("watch?v=")[1]

        YoutubeVideo(youtubeId, function(video){
            mp4 = video.getSource("video/mp4", "medium");
            localStorage.setItem("googleVidUrl", mp4.url);
            console.log("YoutubeId in Content is = " + youtubeId);
            console.log("Window location = " + pathname);
            localStorage.setItem("youTubeTitle",   document.title.replace(/\s+/g, ''))
            localStorage.setItem("youTubeUrl", pathname);
        });
    }

//check for page change every few seconds and update location information
setInterval(checkLocation, 1000);

    //listen for contentJSON request from popup.js
    chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log("Content script listener received message type = " + message.type);
        switch(message.type) {
            case "getContentJSON":
                var googleVidUrl   = localStorage.getItem("googleVidUrl");
                var youTubeTitle   = localStorage.getItem("youTubeTitle");
                var youTubeUrl     = localStorage.getItem("youTubeUrl");

                contentJSON = { "googleVidUrl" : googleVidUrl,
                                "youTubeTitle" : youTubeTitle,
                                "youTubeUrl"   : youTubeUrl
                }

                sendResponse(contentJSON);
                break;
            case "getVars":
                //get variables for video file location
                var currentUrl    = localStorage.getItem("currentUrl");
                var currentTitle  = localStorage.getItem("youTubeTitle");

                currentJSON       = {
                  'url'   : currentUrl,
                  'title' : currentTitle
                }
                sendResponse(currentJSON);
                break;
            default:
                console.error("Unrecognised message: ", message);
           }
        }
    );
});

