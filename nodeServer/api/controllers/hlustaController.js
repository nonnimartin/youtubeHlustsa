'use strict';

var line       = "================================="
var fs         = require('fs');
var https      = require('https');
var url        = require('url');
var request    = require('request');
var mongoose   = require('mongoose');
var ffmpeg     = require ('fluent-ffmpeg');
var Task       = mongoose.model('Tasks');
const serve    = require('serve');
//learning stand-in for finding why private account requests are denied
const ytdl     = require('ytdl-core');

var statusFile         = 'status.json';
var filesServed        = false;

var reqsQueueArray    = [];
var processing        = false;

function writeMp4(filePath, buffer, options) {
  fs.writeFile(filePath, buffer, options, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  }); 
}

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

function setStatus(status, fileName) {

    //Write current status to json file for Chrome to check
    var statusJSON = {
      "status" : status,
      "fileName" : fileName
    };

    fs.writeFile(__dirname + "/../../status/" + statusFile, JSON.stringify(statusJSON), function(err) {
    if (err) throw err;
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

function getInfo(link, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  } else if (!options) {
    options = {};
  }
  if (!callback) {
    return new Promise(function(resolve, reject) {
      getInfo(link, options, function(err, info) {
        if (err) return reject(err);
        resolve(info);
      });
    });
  }
}

function downloadVids(vidUrl, mp4Path, callback) {

  console.log('vid url = ' + vidUrl);
  console.log('vid mp4path = ' + mp4Path);

  //download video information and hold in variable
  var vidStream = ytdl(vidUrl, { filter: function(format) { return format.container === 'mp4'; } });

  vidStream.pipe(fs.createWriteStream(mp4Path));

  vidStream.on('end', () => {
    try {
      callback();
      
    } catch (err) {
      console.log("bad thing = " + err.toString())
    }
  })

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
    var res        = currentReq['res'];
    

    var new_task  = new Task(req.body);
    var sent_body = req.body
    console.log(sent_body)
    var sent_url = sent_body['url']
    var fileName = sent_body['name']
    var youTubeUrl = sent_body['youTubeUrl']
    console.log("Youtube url = " + youTubeUrl);
    var task_id  = new_task.id
    new_task.url = sent_url
    setStatus("processing", fileName);
    serveStatus();
    new_task.save(function(err, task) {
      if (err)
        res.send(err);
      res.json(task);
    });

    var parsedUrl = url.parse(sent_url);

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
              console.log('this is the download return value ' + returnValue.toString());
              mp4ToMp3(mp4Path, function(responseVal) {
                console.log("Response value: " + responseVal);
                moveFile(mp3Path, __dirname + "/../../mp3s/" + fileName + ".mp3");
                setStatus("done", fileName);
          })
        })
      });
    });
   reqsQueueArray.shift();
   processing = false;
  }
}

function processVidRequests() {


  while (reqsQueueArray.length > 0 && !processing) {

    processing     = true;

    var currentReq = reqsQueueArray[0];

    var req        = currentReq['req'];
    var res        = currentReq['res'];
    

    var new_task  = new Task(req.body);
    var sent_body = req.body
    console.log(sent_body)
    var sent_url = sent_body['url']
    var fileName = sent_body['name']
    var youTubeUrl = sent_body['youTubeUrl']
    console.log("Youtube url = " + youTubeUrl);
    var task_id  = new_task.id
    new_task.url = sent_url
    setStatus("processing", fileName);
    serveStatus();
    new_task.save(function(err, task) {
      if (err)
        res.send(err);
      res.json(task);
    });

    var parsedUrl = url.parse(sent_url);

    https.get(parsedUrl, function(res) {
        
        var data = [];

        res.on('data', function(chunk) {
            data.push(chunk);
        }).on('end', function() {

            var buffer = Buffer.concat(data);
            var options = { flag : 'w' };
            
            console.log("Buffer size = " + buffer.byteLength);;

            downloadVids(youTubeUrl, __dirname + "/../../vids/" + fileName + '.mp4', function(returnValue) {
              console.log('this is the download return value ' + returnValue.toString());
              setStatus("done", fileName);
        })
      });
    });
   reqsQueueArray.shift();
   processing = false;
  }
}

//REST API functions
exports.receive_url = function(req, res) {

  queueRequests(req, res);
  
  if (!processing && reqsQueueArray.length != 0) {
  setInterval(processRequests, 3000);
  }

};

exports.receive_vid_url = function(req, res) {

  queueRequests(req, res);
  
  if (!processing && reqsQueueArray.length != 0) {
  setInterval(processVidRequests, 3000);
  }

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
  setStatus('ready', '');
}

exports.get_record = function(req, res) {
  
  var sent_id = req.params.id

  Task.findById(sent_id, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};

exports.get_records = function(req, res) {
  Task.find({}, function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};

exports.create_a_task = function(req, res) {
  var new_task = new Task(req.body);
  new_task.save(function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });
};


exports.delete_a_task = function(req, res) {

  Task.remove({
    _id: req.params.taskId
  }, function(err, task) {
    if (err)
      res.send(err);
    res.json({ message: 'Task successfully deleted' });
  });
};

