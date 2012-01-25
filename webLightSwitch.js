var SerialPort = require('serialport').SerialPort;
var server = require('./lib/server');
var router = require('./lib/router');
var url = require('url');

//
// Custom configuration
//

// Set the API_KEY value to a value of your choosing
var API_KEY = 'changeMe';
// Change the serial port name as appropriate
var SERIAL_PORT_NAME = '/dev/ttyUSB0';

var DEVICES = {
  // add devices to control to this object
  // the index should be unique
  // the following are examples
  0: {name: 'Nightstand', address: [0x01, 0x02, 0x03]},
  1: {name: 'Porch', address: [0x04, 0x05, 0x06]}
};

//
// Done with configuration
//

var INSTEON_PLM_START = 0x02;
var INSTEON_STANDARD_MESSAGE = 0x62;
var INSTEON_MESSAGE_FLAG = 0x05;
var INSTEON_COMMAND_LIGHT_ON = 0x11;
var INSTEON_COMMAND_LIGHT_OFF = 0x13;

var sp = new SerialPort(SERIAL_PORT_NAME, {
	baudrate: 19200,
	databits: 8,
	stopbits: 1,
	parity: 0,
	flowcontrol: 0
});


sp.on('data', function(data) {
	console.log('Received data: ' + hexFormat(data));
});

function status(response, request) {
        if (!_validApiKey(response, request)) {
                _contentUnauthorized(response, request);
                return;
        }

        console.log("Request handler 'status' was called.");
        _contentControl(response, request);
}

function on(response, request) {
	if (!_validApiKey(response, request)) {
		_contentUnauthorized(response, request);
		return;
	}

	var parsedRequest = url.parse(request.url, true);
	var query = parsedRequest.query;
	var device = -1; 

	if ((query !== undefined) && (query.device !== undefined)) {
		device = query.device;
	}

	console.log("Request handler 'on' was called.");
        console.log("Turning on: " + DEVICES[device].name + ' at address: ' + DEVICES[device].address);

	var message = [];

	message.push(INSTEON_PLM_START);
	message.push(INSTEON_STANDARD_MESSAGE);
	for (var i in DEVICES[device].address) {
		message.push(DEVICES[device].address[i]);
	}
	message.push(INSTEON_MESSAGE_FLAG);
	message.push(INSTEON_COMMAND_LIGHT_ON);
	message.push(0xFF);

	console.log("Writing: " + hexFormat(message));

	sp.write(message);

	_contentControl(response, request);
}

function off(response, request) {
	if (!_validApiKey(response, request)) {
		_contentUnauthorized(response, request);
		return;
	}

	var parsedRequest = url.parse(request.url, true);
	var query = parsedRequest.query;
        var device = -1;

	if ((query !== undefined) && (query.device !== undefined)) {
		device = query.device;
	}

	console.log("Request handler 'off' was called.");
        console.log("Turning off: " + DEVICES[device].name + ' at address: ' + DEVICES[device].address);

	var message = [];

	message.push(INSTEON_PLM_START);
	message.push(INSTEON_STANDARD_MESSAGE);
	for (var i in DEVICES[device].address) {
		message.push(DEVICES[device].address[i]);
	}
	message.push(INSTEON_MESSAGE_FLAG);
	message.push(INSTEON_COMMAND_LIGHT_OFF);
	message.push(0xFF);

	console.log("Writing: " + hexFormat(message));

	sp.write(message);

	_contentControl(response, request);
}

function _validApiKey(response, request) {
	var parsedRequest = url.parse(request.url, true);
	var query = parsedRequest.query;

	if ((query !== undefined) && (query.apiKey !== undefined)) {
		return (API_KEY == query.apiKey);
	}

	return false;
}

function _contentUnauthorized(response, request) {
	var body = '<html>'
		+ '<head>'
		+ '<title>Unauthorized</title>'
		+ '</head>'
		+ '<body>'
		+ '<p>Unauthorized request</p>'
		+ '</body>'
		+ '</html>';

	response.writeHead(200, {
		"Content-Type" : "text/html"
	});
	response.write(body);
	response.end();
}

function _contentControl(response, request) {
	var parsedRequest = url.parse(request.url, true);
	var query = parsedRequest.query;
	var apiKey;

	if ((query !== undefined) && (query.apiKey !== undefined)) {
		apiKey = query.apiKey;
	}

	response.setHeader("Cache-Control", "no-cache");

	var query = (apiKey === undefined) ? "" : "?apiKey=" + apiKey;

	var body = '<!DOCTYPE html>' + '<html>' + '<head>'
		        + '<title>Web Light Switch</title>'
			+ '<meta name="viewport" content="width=device-width, initial-scale=1">'
			+ '<link rel="stylesheet" href="http://code.jquery.com/mobile/1.0/jquery.mobile-1.0.min.css" />'
			+ '<script type="text/javascript" src="http://code.jquery.com/jquery-1.6.4.min.js"></script>'
			+ '<script type="text/javascript" src="http://code.jquery.com/mobile/1.0/jquery.mobile-1.0.min.js"></script>'
			+ '</head>' + '<body>'
			+ '<div data-role="page">'
			+ '<div data-role="header">'
			+ '<h1>Home</h1>'
			+ '</div><!-- /header -->'
			+ '<div data-role="content">';


	for (var i in DEVICES) {
		body += '<p>' + DEVICES[i].name + ': <a href="/on' + query + '&device=' + i + '" data-role="button" data-ajax="false" data-inline="true">On</a> <a href="/off' + query + '&device=' + i + '" data-role="button" data-ajax="false" data-inline="true">Off</a></p>';
		body += '<hr/>';
	}




	body +=		  '</div><!-- /content -->'
			+ '</div><!-- /page -->'
			+ '</body>' + '</html>';

	response.writeHead(200, {
		"Content-Type" : "text/html"
	});
	response.write(body);
	response.end();
}

// Convert a decimal value < 256 to a hex value. The return value will be a
// two character upper case value.
function dec2hex(i) {
	return (i + 0x100).toString(16).substr(-2).toUpperCase();
};

// Convert a decimal array to a hex string.
function hexFormat(data) {
	var result = "";
	var prefix = "";
	for (var i in data) {
		result += prefix + dec2hex(data[i]);
		prefix = " ";
	}
	
	return result;
}

var handle = {};
handle["/"] = status;
handle["/on"] = on;
handle["/off"] = off;

server.start(router.route, handle);
