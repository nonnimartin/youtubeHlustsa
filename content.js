$(document).ready(function () {

    chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
        switch(message.type) {
            case "getVars":
                var vars = []
                var url  = localStorage.getItem("vidUrl");
                var name = localStorage.getItem("vidName");
                vars.push(url)
                vars.push(name)
                sendResponse(vars);
                break;
            default:
                console.error("Unrecognised message: ", message);
           }
        }
    );

    function httpGet(theUrl) {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false );
        //xmlHttp.send( null );
        return xmlHttp.responseText;
    }
  
    buttonsDiv = $( "#watch8-secondary-actions")
    var pathname   = window.location;
    var youtubeId  = pathname.toString().split("watch?v=")[1]

    YoutubeVideo(youtubeId, function(video){
        mp4 = video.getSource("video/mp4", "medium");
        localStorage.setItem( "vidUrl", mp4.url);
        localStorage.setItem("vidName", youtubeId);
    });

    // window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
    // //window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, onInitFs, errorHandler)

    // window.requestFileSystem(window.TEMPORARY, 5*1024*1024 /*5MB*/, function (filesystem) {      
    //     fileSysObj = filesystem;
    // }, function (e) { console.log("Could not request File System"); });

    // setTimeout(function() {writeToFile(fileSysObj);}, 1000);
    // setTimeout(function() {readFromFile(fileSysObj);}, 2050);

    //buttonsDiv.append('<button class="jucheDownload" type="button" title="Get MP3">Get MP3</button>')

    // $( ".jucheDownload" ).click(function() {
    //   alert( "Handler for .click() called." );
    // });

});

