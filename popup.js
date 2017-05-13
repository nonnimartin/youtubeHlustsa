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
    
    var result = xmlHttp.response;

    var args = '-i my_video.mp4 -c copy -map 0:a output_audio.mp4'

    var results = ffmpeg_run({
        arguments: args,
        files: [
        {
          data: result,
          name: "test"
        }
       ]
    });

  //   console.log(xmlHttp.response);
  //   var buffer = new ArrayBuffer( res.length );
  //   console.log(buffer.toString());
  //   view   = new Uint8Array( buffer );
  //   len    = view.length;
  //   //return xmlHttp.responseText;
  //   fromCharCode = String.fromCharCode, i, s, str;
  //   str = "";
    
  //   for ( i = len; i--; ) {
 	//   view[i] = res[i].charCodeAt(0);
 	//     }

  //   }

 	// for ( i = 0; i < len; ++i ) {
 	//   str += fromCharCode( view[i] );
 	// }  

  //   str = "";

 	// for ( i = 0; i < len; ++i ) {
 	//   str += fromCharCode( res[i].charCodeAt(0) & 0xff );
 	// }

// function httpGet(theUrl) {
//     var xmlHttp = new XMLHttpRequest();
//     //test
//     console.log(theUrl)
//     var reader = new FileReader();
//     xmlHttp.open( "GET", theUrl);
//     //xmlHttp.responseType = "arraybuffer";
//     xmlHttp.send( null );
    
//     console.log(xmlHttp.responseText);

//     var res = xmlHttp.response;

//     var buffer = new ArrayBuffer( res.length ),
//     view   = new Uint8Array( buffer ),
//     len    = view.length,
//     fromCharCode = String.fromCharCode, i, s, str;

// 	str = "";

// 	for ( i = len; i--; ) {
// 	  view[i] = res[i].charCodeAt(0);
// 	}

// 	for ( i = 0; i < len; ++i ) {
// 	  str += fromCharCode( view[i] );
// 	}    

// 	str = "";

// 	for ( i = 0; i < len; ++i ) {
// 	  str += fromCharCode( res[i].charCodeAt(0) & 0xff );
// 	}

// 	console.log(str)

// }

// function httpGet(theUrl) {
// 	var xmlHttp = new XMLHttpRequest();
// 	xmlHttp.open("GET", theUrl);
// //  xmlHttp.responseType = "arraybuffer";

// //  var blob = new Blob([xmlHttp.response], {type: "video/mp4"});
// //  var objectUrl = URL.createObjectURL(blob);
//     var blob = new Blob([xmlHttp.responseText], {type: "video/mp4"});
// 	xmlHttp.send();
	
// 	return xmlHttp.responseText;


// }

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
            	
            	httpGet(url);
                
                //downloadContent(data, "file.mp4");
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

