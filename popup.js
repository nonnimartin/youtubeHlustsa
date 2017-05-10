function downloadContent(url, fileName) {
	chrome.downloads.download({
	    url:      url,
		filename: fileName
	});
};

function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
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
            	var data = httpGet(url);

                //var results = ffmpeg_run({
				  
				 // arguments: argsString,
				 // files: [
				 //   {
				 //     data: UInt8Array,
				 //     name: string
				 //   }
				 // ]
				 // });

				// results is an Array of { data: UInt8Array, name: string }
				// results.forEach(function(file) {
				//   console.log("File recieved", file.name, file.data);
				// });

            }
        })
    })
};



document.getElementById('getVid').addEventListener('click', getVid);
document.getElementById('getMp3').addEventListener('click', getMp3);

