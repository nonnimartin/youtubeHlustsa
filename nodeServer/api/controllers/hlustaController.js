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

var statusFile = 'status.json';
var filesServed   = false;

function writeMp4(fileName, buffer, options) {
  fs.writeFile("/tmp/" + fileName + ".mp4", buffer, options, function(err) {
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

function serveFile() {

  console.log("Files served: " + global.filesServed)

  if (!global.filesServed) {
    const server = serve(__dirname + "/../../mp3s", {
      port: 3001
    })
    global.filesServed = true;
  }
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

//REST API functions
exports.receive_url = function(req, res) {
  var new_task  = new Task(req.body);
  var sent_body = req.body
  console.log(sent_body)
  var sent_url = sent_body['url']
  var fileName = sent_body['name']
  var cookies  = sent_body['cookies']
  var task_id  = new_task.id
  console.log("Id = " + task_id)
  console.log("Cookies: " + cookies)
  console.log("Setting URL: " + sent_url)
  new_task.url = sent_url
  setStatus("processing", fileName);
  serveStatus();
  new_task.save(function(err, task) {
    if (err)
      res.send(err);
    res.json(task);
  });

  https.get(url.parse(sent_url), function(res) {
      var data = [];

      res.on('data', function(chunk) {
          data.push(chunk);
      }).on('end', function() {
          //at this point data is an array of Buffers
          //so Buffer.concat() can make us a new Buffer
          //of all of them together
          var buffer = Buffer.concat(data);
          var options = { flag : 'w' };
          
          console.log("Buffer size = " + buffer.byteLength);
          console.log("Writing file to /tmp/" + fileName + ".mp4");

          //Write file to /tmp/$filename.mp4 location
          var mp4Path  = "/tmp/" + fileName + ".mp4"
          var mp3Path  = mp4Path.split(".")[0] + ".mp3";
          writeMp4(fileName, buffer, options);

          //Convert mp4 to mp3
          console.log("Converting mp4 at " + mp4Path + " to mp3")

           mp4ToMp3(mp4Path, function(responseVal) {
              console.log("Response value: " + responseVal);
              moveFile(mp3Path, __dirname + "/../../mp3s/" + fileName + ".mp3");
              serveFile();
              setStatus("done", fileName);
        })

      });
  });
};

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

