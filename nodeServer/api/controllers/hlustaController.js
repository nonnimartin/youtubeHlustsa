'use strict';

var line      = "================================="
var fs        = require('fs');
var https     = require('https');
var url       = require('url');
var request   = require("request");
var mongoose  = require('mongoose');
var 
Task = mongoose.model('Tasks');

function writeFile(fileName, buffer, options) {
  fs.writeFile("/tmp/" + fileName + ".mp4", buffer, options, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("The file was saved!");
  }); 
}

exports.receive_url = function(req, res) {
  console.log("got here")
  var new_task  = new Task(req.body);
  var sent_body = req.body
  console.log(sent_body)
  var sent_url = sent_body['url']
  var fileName = sent_body['name']
  var task_id  = new_task.id
  console.log("Id = " + task_id)
  console.log("Setting URL: " + sent_url)
  new_task.url = sent_url
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
          console.log(res)
          //console.log(buffer.toString('utf8'));
          var options = { flag : 'w' };
          console.log("Buffer size = " + buffer.byteLength);
          console.log("Writing file to /tmp/" + fileName + ".mp4");
          //setTimeout(writeFile, 10000, fileName, buffer, options);
          writeFile(fileName, buffer, options);
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

