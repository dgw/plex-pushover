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

app.get('*', function (req, res) {
	res.sendStatus(405);
});

app.post('/', upload.single('thumb'), function (req, res, next) {
	var payload = JSON.parse(req.body.payload);

	if(payload.event === "media.play") {
		var msg = {};

		if(payload.Metadata.type === 'movie') {
			// Movies
			msg.title = "Plex: " + payload.Account.title;
			msg.message = payload.Metadata.title;
			if(payload.Metadata.year !== undefined) {
				msg.message += " (" + payload.Metadata.year + ")";
			}
		}
		else if(payload.Metadata.type === 'episode') {
			// TV Shows - note padStart() requires node 8, or the --harmony flag in node 7
			msg.title = "Plex: " + payload.Account.title;
			msg.message = "Show: " + payload.Metadata.grandparentTitle +
					"\nEpisode: " + payload.Metadata.parentIndex +
					"x" + payload.Metadata.index.toString().padStart(2, "0") +
					" " + payload.Metadata.title;
		}
		else {
			// "Unsupported Media Type" is a good in-joke for this, isn't it?
			res.sendStatus(415);
			return;
		}

		msg.title += " via " + payload.Player.title + " (" + ((payload.Player.local) ? "local" : "remote") + ")";
		msg.url = "https://app.plex.tv/desktop#!/server/" + 
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
	else {
		// Unknown action, send a "Not Implemented" error response
		res.sendStatus(501);
	}
});

app.listen(process.env['PLEXPUSH_PORT'] || 10000);
