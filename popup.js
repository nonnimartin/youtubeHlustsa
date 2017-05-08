function sendVarRequest() {

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "getVars"}, function(vars) {
            if (typeof vars == "undefined") {
                 if (chrome.runtime.lastError) {
                 	console.log("Could not talk to script")
                 // We couldn't talk to the content script, probably it's not there
                 }
            }
            else {
            	var url      = vars[0];
            	var fileName = vars[1];

				chrome.downloads.download({
				  url: url,
				  filename: fileName + '.mp4'
				});
            }
        })
    })
};

document.getElementById('getVid').addEventListener('click', sendVarRequest);

