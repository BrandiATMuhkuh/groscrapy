var express = require('express');    //Express Web Server 
var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation
var nodecr = require('nodecr');

var app = express();
app.use(busboy());
app.use(express.static(path.join(__dirname, 'public')));

/* ========================================================== 
Create a Route (/upload) to handle the Form submission 
(handle POST requests to /upload)
Express v4  Route definition
============================================================ */
app.route('/upload')
    .post(function (req, res, next) {

    	

        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            fstream = fs.createWriteStream(__dirname + '/img/' + filename);
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + filename);
                startOCR(filename);       
                res.redirect('back');           //where to go next
            });
        });
        req.busboy.on('field', function(fieldname, val) {
	     // console.log(fieldname, val);
	     console.log(val);
	   });

        req.busboy.on('finish', function(){
	    	console.log("done with everything. Start next thing.");
	   });
    });


function startOCR(filename){
	// Recognise text of any language in any format
	nodecr.process(__dirname + '/img/'+filename,function(err, text) {
	    if(err) {
	        console.error(err);
	    } else {
	        console.log(text);
	    }
	});
}




var server = app.listen(3030, function() {
    console.log('Listening on port %d', server.address().port);
});