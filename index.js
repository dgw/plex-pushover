var express = require('express')
  , request = require('request')
  , multer  = require('multer');

var upload = multer({ dest: '/tmp/' });
var app = express();

var push = require('pushover-notifications');

var p = new push( {
	user: process.env['PUSHOVER_USER'],
	token: process.env['PUSHOVER_TOKEN'],
});

app.post('/', upload.single('thumb'), function (req, res, next) {
	var payload = JSON.parse(req.body.payload);

	if(payload.event === "media.play") {
		var msg = {};

		if(payload.Metadata.librarySectionID === 1) {
			// Movies
			msg.title = "Plex: " + payload.Account.title;
			msg.message = payload.Metadata.title;
		}
		else if(payload.Metadata.librarySectionID === 2) {
			// TV Shows
			msg.title = "Plex: " + payload.Account.title;
			msg.message = "Show: " + payload.Metadata.grandparentTitle +
							"\nEpisode: " + payload.Metadata.title;
		}

		msg.url = "https://app.plex.tv/web/app#!/server/" + 
					payload.Server.uuid + "/details/" + 
					encodeURIComponent(payload.Metadata.key);
		msg.url_title = "View details";

		p.send( msg, function( err, result) {
			if( err ) {
				throw err;
			}

			// console.log( result );
		});
	
		res.sendStatus(200);
	}
});

app.listen(10000);