$(document).ready(function () {

    var pathname   = window.location;
    var youtubeId  = pathname.toString().split("watch?v=")[1]

    YoutubeVideo(youtubeId, function(video){
        mp4 = video.getSource("video/mp4", "medium");
        localStorage.setItem("googleVidUrl", mp4.url);
        var googleVidUrlToChange = localStorage.getItem("googleVidUrl");
        console.log("Google video URL to change is " + googleVidUrlToChange);
        localStorage.setItem("youTubeTitle",   document.title.replace(/\s+/g, ''))
    });


    //listen for contentJSON request from popup.js
    chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        console.log("Content script listener received message type = " + message.type);
        switch(message.type) {
            case "getContentJSON":

                var url            = localStorage.getItem("upatedYoutubeUrl");
                console.log("Content url value is: " + url);
                var googleVidUrl   = localStorage.getItem("googleVidUrl");
                var youTubeTitle   = localStorage.getItem("youTubeTitle");

                contentJSON = { "url" : url, "googleVidUrl" : googleVidUrl, "youTubeTitle" : youTubeTitle }

                sendResponse(contentJSON);
                break;
            default:
                console.error("Unrecognised message: ", message);
           }
        }
    );
});

