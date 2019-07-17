var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  Task = require('./api/models/hlustaModel'),
  bodyParser = require('body-parser');
  
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/hlustaDB'); 
var serve = require('serve');
var fs    = require('fs');
var exec = require('child_process').exec;

function puts(error, stdout, stderr) { console.log(stdout) }

function closePort(port) {
  //kill process on reservrd ports
  exec("lsof -t -i tcp:" + port + " | xargs kill", puts);
}

function serveFiles() {

  console.log("Files served: " + global.filesServed)

  if (!global.filesServed) {
    const server     = serve(__dirname + "/mp3s", {
      port: 3001
    })
    const server_two = serve(__dirname + "/vids", {
      port: 3003
    })
    global.filesServed = true;
  }
}

function serveStartupStatus() {

    //Write current status to json file for Chrome to check
    var statusJSON = {
      "status" : "startup"
    };

    fs.writeFile(__dirname + "/status/status.json", JSON.stringify(statusJSON), function(err) {
    if (err) throw err;
    });
//serve the status.json location
    const server = serve(__dirname + "/status", {
      port: 3002
    })
    global.statusServed = true;
}

closePort("3001");
closePort("3002");
closePort("3003");

serveStartupStatus();
serveFiles();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./api/routes/hlustaRoutes');
routes(app);


app.listen(port);


console.log('Youtube Convert Video to MP3 RESTful API server started on port: ' + port);