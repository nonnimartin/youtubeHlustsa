$(document).ready(function () {

    var buttonsDiv = $( "#watch8-secondary-actions")
    var pathname   = window.location;
    var youtubeId  = pathname.toString().split("watch?v=")[1]
    //buttonsDiv.append('<button class="yt-uix-button yt-uix-button-size-default yt-uix-button-opacity yt-uix-button-has-icon no-icon-markup pause-resume-autoplay action-panel-trigger action-panel-trigger-share yt-uix-tooltip" type="button" onclick=";return false;" title="Share"data-trigger-for="action-panel-share" data-button-toggle="true" data-tooltip-text="Download"aria-labelledby="yt-uix-tooltip25-arialabel"></button>')
    buttonsDiv.append('<button class="jucheDownload" type="button" title="Get MP3">Get MP3</button>')

    $( ".jucheDownload" ).click(function() {
      alert( "Handler for .click() called." );
    });

    

});