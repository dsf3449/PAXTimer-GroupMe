var HTTPS = require('https');
var cool = require('cool-ascii-faces');

var botID = process.env.BOT_ID;

function respond() {
    var request = JSON.parse(this.req.chunks[0]),
        botRegex = /^\.pax$/;

    if (request.text && botRegex.test(request.text)) {
        this.res.writeHead(200);
        postMessage();
        this.res.end();
    } else {
        console.log("ignore");
        this.res.writeHead(200);
        this.res.end();
    }
}

var endD = new Date("Fri Sep 1 2017 16:00:00 GMT+0000").getTime();
var departureDate = new Date("Mon Sep 4 2017 18:35:00 GMT+0000").getTime();
var paxEndDate = new Date("Mon Sep 4 2017 07:00:00 GMT+0000").getTime();
var firstDepartureDate = new Date("Fri Sep 1 2017 0:20:00 GMT+0000").getTime();

function currentTime() {
    var test = new Date().getTime();
    return test;
}

function calc(incoming, incoming2) {
    var d = currentTime();
    var distance = incoming - d;
	var distance2 = firstDepartureDate - d;
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
	var days2 = Math.floor(distance2 / (1000 * 60 * 60 * 24));
    var hours2 = Math.floor((distance2 % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes2 = Math.floor((distance2 % (1000 * 60 * 60)) / (1000 * 60));
    var seconds2 = Math.floor((distance2 % (1000 * 60)) / 1000);
    if (incoming2 == 1) {
        var type = "PAX West 2017.";
    } else if (incoming2 == 2) {
        var type = "estimated departure.";
    } else if (incoming2 == 3) {
        var type = "PAX is over.";
    }
    if (days > 1) {
        return "There are " + days + " days, " + hours + " hours, " + minutes + " minutes, and " + seconds + " seconds until " + type + "\n\nAdditionally, time to estimated departure: " + days2 + "d " + hours2 + "h " + minutes2 + "m " + seconds2 + "s";
    } else if (days == 1) {
		if (firstDepartureDate - currentTime() > 0) {
			return "There is " + days + " day, " + hours + " hours, " + minutes + " minutes, and " + seconds + " seconds until " + type + "\n\nAdditionally, time to estimated departure: " + days2 + "d " + hours2 + "h " + minutes2 + "m " + seconds2 + "s";
		}
		else {
			return "There is " + days + " day, " + hours + " hours, " + minutes + " minutes, and " + seconds + " seconds until " + type;
		}
    } else if (days == 0) {
        if (days == 0 && hours == 0 && minutes == 0) {
            return "There are " + seconds + " seconds until " + type;
        }
        if (days == 0 && hours == 0) {
            return "There are " + minutes + " minutes and " + seconds + " seconds until " + type;
        }
		if (firstDepartureDate - currentTime() > 0) {
			return "There are " + hours + " hours, " + minutes + " minutes, and " + seconds + " seconds until " + type + "\n\nAdditionally, time to estimated departure: " + days2 + "d " + hours2 + "h " + minutes2 + "m " + seconds2 + "s";
		}
		else {
			return "There are " + hours + " hours, " + minutes + " minutes, and " + seconds + " seconds until " + type;
		}
    }
}

function postMessage() {
    var botResponse, options, body, botReq;

    if (endD - currentTime() > 0) {
        botResponse = calc(endD, 1);
    } else if (departureDate - currentTime() < 0) {
        botResponse = "PAX West 2017 is now over.";
    } else if (paxEndDate - currentTime() < 0) {
        botResponse = "PAX West 2017 is now over.\n" + calc(departureDate, 2);
    } else if (endD - currentTime() < 0) {
        botResponse = "Dude, PAX is going on right now.  Stop talking to a bot and go do something cool.\n(Error 1: PAX is in progress!)\n" + calc(paxEndDate, 3);
    }

    options = {
        hostname: 'api.groupme.com',
        path: '/v3/bots/post',
        method: 'POST'
    };

    body = {
        "bot_id": botID,
        "text": botResponse
    };

    console.log('sending ' + botResponse + ' to ' + botID);

    botReq = HTTPS.request(options, function(res) {
        if (res.statusCode == 202) {
            //it do
        } else {
            console.log('rejecting bad status code ' + res.statusCode);
        }
    });

    botReq.on('error', function(err) {
        console.log('error posting message ' + JSON.stringify(err));
    });
    botReq.on('timeout', function(err) {
        console.log('timeout posting message ' + JSON.stringify(err));
    });
    botReq.end(JSON.stringify(body));
}


exports.respond = respond;