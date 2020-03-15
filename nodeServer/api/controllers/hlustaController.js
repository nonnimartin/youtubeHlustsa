'use strict';

var fs            = require('fs');
var https         = require('https');
var url           = require('url');
var download      = require('download');
var ffmpeg        = require ('fluent-ffmpeg');
const serve       = require('serve');
const ps          = require('python-shell');

var statusFile         = 'status.json';

var reqsQueueArray    = [];
var processing        = false;

function mp4ToMp3(mp4Path, callback) {
  var mp3Path = mp4Path.split('.')[0] + '.mp3';
  ffmpeg({source:mp4Path})
      .format('mp3')
      .on('error', function(err) {
        console.log('An error occurred: ' + err.message);
        //send callback error
        callback("error");
      })
      .save(mp3Path)
      .on('end', function(stdout, stderr) {
        console.log("");
        console.log('Transcoding succeeded! Deleting ' + mp4Path);
        //Delete mp4 file after conversion
        deleteFile(mp4Path);
        console.log('File deleted successfully.');
        //send callback success
        callback("success");
      });
}

function serveStatus() {

  console.log("Status served: " + global.statusServed);

  if (!global.statusServed) {
    const server = serve(__dirname + "/../../status", {
      port: 3002
    })
    global.statusServed = true;
  }
}

function getStatus(uuid){
    
    var statusFilePath = __dirname + "/../../status/" + statusFile;
    //get existing status from file
    var data = fs.readFileSync(statusFilePath, 'utf8');
    var fileContent = JSON.parse(data);
    var thisJobInfo = fileContent[uuid];
    if (thisJobInfo == undefined){
      return false;
    }else{
      return thisJobInfo.status;
    }
}

function setStatus(status, fileName, type, uuid) {

     var dataObj = new Object();

     var statusFilePath = __dirname + "/../../status/" + statusFile;
     console.log('status file path = ' + statusFilePath);

    //get existing status from file
    fs.readFile(statusFilePath, 'utf8', function(err, data) {
      if (err) throw err;
      var fileContent = data;
      console.log('reading file data: ' + data);

      //parse json file to javascript object
      console.log('data = ' + data);
      if (data == null || data == undefined || data == '' || JSON.parse(data).status == 'startup') data = '{}';
      dataObj = JSON.parse(data);

      //Write current status to json file for Chrome to check
      var statusJSON = {
        "status" : status,
        "fileName" : fileName,
        "fileType" : type
      };

      //write status json mapped to uuid
      dataObj[uuid] = statusJSON;

      fs.writeFileSync(statusFilePath, JSON.stringify(dataObj));

    });

}

function deleteFile(filePath) {
  fs.unlink(filePath, (err) => {
    if (err) throw err;
    console.log('Successfully deleted ' + filePath);
    });
}

function moveFile(fromPath, toPath) {
  fs.rename(fromPath, toPath, function (err) {
    if (err) throw err;
    console.log('Move complete.');
    console.log('Moved ' + fromPath + " to " + toPath);
  })
}

function downloadVids(vidUrl, mp4Path, callback) {

  console.log('vid url = ' + vidUrl);
  console.log('vid mp4path = ' + mp4Path);

  var options = {
    args: [vidUrl]
  };

  ps.PythonShell.run('./api/controllers/call_pytube.py', options, function (err, results) {
    if (err) throw err;
    var actualYoutubeVideoLocation = results;
    callback(actualYoutubeVideoLocation);
  });

}

function queueRequests(req, res) {

  var currentReqArray = {
    'req' : req,
    'res' : res
  }

  reqsQueueArray.push(currentReqArray);

}

function processRequests() {

  while (reqsQueueArray.length > 0 && !processing) {

    processing     = true;

    var currentReq = reqsQueueArray[0];
    var req        = currentReq['req'];
     
    var sent_body = req.body;
    var sent_url   = sent_body['url'];
    var fileName   = sent_body['name'];
    var youTubeUrl = sent_body['youTubeUrl'];
    var jobUuid    = sent_body['jobUuid'];

    setStatus("processing", fileName, 'mp3', jobUuid);
    serveStatus();

    var parsedUrl = url.parse(sent_url);
    var status = getStatus(jobUuid)

    if (status == 'processing' || status == 'done') continue;

    https.get(parsedUrl, function(res) {
        
        var data = [];

        res.on('data', function(chunk) {
            data.push(chunk);
        }).on('end', function() {

            var buffer = Buffer.concat(data);
            var options = { flag : 'w' };
            
            console.log("Buffer size = " + buffer.byteLength);
            console.log("Writing file to /tmp/" + fileName + ".mp4");

            //Write file to /tmp/$filename.mp4 location
            var mp4Path  = "/tmp/" + fileName + ".mp4"
            var mp3Path  = mp4Path.split(".")[0] + ".mp3";

            downloadVids(youTubeUrl, mp4Path, function(returnValue) {
              download(returnValue.toString()).then(data => {
                fs.writeFileSync(mp4Path, data);
                mp4ToMp3(mp4Path, function(responseVal) {
                  console.log("Response value: " + responseVal);
                  moveFile(mp3Path, __dirname + "/../../mp3s/" + fileName + ".mp3");
                  setStatus("done", fileName, "mp3", jobUuid);
                })
              });
            });
        })
      });
   reqsQueueArray.shift();
   processing = false;
   return;
  }
}

function processVidRequests() {

  while (reqsQueueArray.length > 0 && !processing) {

    processing     = true;

    var currentReq = reqsQueueArray[0];
    var req        = currentReq['req'];
    var sent_body = req.body;
    var sent_url = sent_body['url'];
    var fileName = sent_body['name'];
    var youTubeUrl = sent_body['youTubeUrl'];
    var jobUuid    = sent_body['jobUuid'];
    
    setStatus("processing", fileName, "mp4", jobUuid);
    serveStatus();

    var parsedUrl = url.parse(sent_url);

    var status = getStatus(jobUuid)

    if (status == 'processing' || status == 'done') continue;

    https.get(parsedUrl, function(res) {
        
        var data = [];

        res.on('data', function(chunk) {
            data.push(chunk);
        }).on('end', function() {
            
            var mp4Path =  "/tmp/" + fileName + '.mp4';

            downloadVids(youTubeUrl, mp4Path, function(returnValue) {
              download(returnValue.toString()).then(data => {
                fs.writeFileSync(mp4Path, data);
                moveFile(mp4Path, __dirname + "/../../vids/" + fileName + ".mp4");
                setStatus("done", fileName, "mp4", jobUuid);
              });
            })
        });
    });
   reqsQueueArray.shift();
   processing = false;
   return;
  }
}

//REST API functions
exports.receive_url = function(req, res) {

  queueRequests(req, res);
  
  if (!processing && reqsQueueArray.length != 0) {
    processRequests();
  }

};

exports.receive_vid_url = function(req, res) {
  queueRequests(req, res);
  
  if (!processing && reqsQueueArray.length != 0) {
    processVidRequests();
  }

};

exports.delete_vid = function(req, res) {

  var vidsDir = __dirname + "/../../vids/";

  console.log('get req body');
  var reqBody    = req.body;
  var thisFile = reqBody['deleteFile']; 
  
  //delete the file
  var deletePath = vidsDir + thisFile;
  console.log('delete path = ' + deletePath);
  deleteFile(deletePath);
  return;

};


exports.clear_backups = function(req, res) {

  var mp3sDir = __dirname + "/../../mp3s/";

  fs.readdir(mp3sDir, function (err, files) {
      if (err) {
          throw err;
      }else {
        for (var i in files) {
          deleteFile(mp3sDir + files[i]);
        }
      }
  });

};

exports.ready_status = function(req, res) {
  setStatus('ready', '', '', '');
};

