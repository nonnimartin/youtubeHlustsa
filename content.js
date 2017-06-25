$(document).ready(function () {

    //buttonsDiv = $( "#watch8-secondary-actions")
    var pathname   = window.location;
    var youtubeId  = pathname.toString().split("watch?v=")[1]

    YoutubeVideo(youtubeId, function(video){
        mp4 = video.getSource("video/mp4", "medium");
        localStorage.setItem("googleVidUrl", mp4.url);
        localStorage.setItem("youTubeTitle",   document.title.replace(/\s+/g, ''))
    });


    //listen for contentJSON request from popup.js
    chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "sendCurrentURL":

                var url            = localStorage.getItem("upatedYoutubeUrl");
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

    // chrome.runtime.sendMessage({type: "getTitle"}, function(title) {
    //     if (typeof title == "undefined") {
    //          if (chrome.runtime.lastError) {
    //           console.log("Could not talk to content.js")
    //          }
    //     }
    //     else {
    //         //Retrieve current title form content script
    //         console.log("got hur" + " and url is " + url + "and name = " + title);

    //     }
    // });

});

