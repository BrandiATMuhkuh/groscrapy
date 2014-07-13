var SocketIOFileUploadServer = require('socketio-file-upload');
var app = require('express')()
.use(SocketIOFileUploadServer.router);
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation
var nodecr = require('nodecr');
var classifier = require('classifier');


var bayes = new classifier.Bayesian({
  backend: {
    type: 'Redis',
    options: {
      hostname: 'localhost', // default
      port: 6379,            // default
      name: 'companyTest'      // namespace for persisting
    }
  }
});

app.get('/', function(req, res){
  res.sendfile('public/socect.html');
});

io.on('connection', function(socket){

	// Make an instance of SocketIOFileUploadServer and listen on this socket:
    var uploader = new SocketIOFileUploadServer();
    uploader.dir = "img";
    uploader.listen(socket);
    // Do something when a file is saved:
    uploader.on("saved", function(event){
        console.log(event.file.pathName);
        io.emit('fileUploaded', {pathname: event.file.pathName});
    });

    // Error handler:
    uploader.on("error", function(event){
        console.log("Error from uploader", event);
    });

	socket.on('chat message', function(msg){
		io.emit('fileUploaded', "I got id: "+msg);
	});

	socket.on('submitCompany', function(msg){
		console.log(msg);
		startOCR(msg.pathname, msg.name);
	});

	socket.on('submitGetCompany', function(msg){
		console.log(msg);
		getCompanyName(msg.pathname);
	});
});


function startOCR(filename, compnayName){
	// Recognise text of any language in any format
	nodecr.process(__dirname + '/'+filename,function(err, text) {
	    if(err) {
	        console.error(err);
	    } else {
	        console.log(text);
	        bayes.train(filename, compnayName);
	    }
	});
}

function getCompanyName(filename){
	// Recognise text of any language in any format
	nodecr.process(__dirname + '/'+filename,function(err, text) {
	    if(err) {
	        console.error(err);
	    } else {
	        console.log(text);
	        bayes.classify(text, function(category) {
			  console.log("classified in: " + category);
			});
	    }
	});
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});