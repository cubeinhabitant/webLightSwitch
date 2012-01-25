var http = require("http");
var url = require("url");

//var server = process.env.IP || "127.0.0.1";
var server = process.env.IP || "0.0.0.0";
var port = process.env.PORT || 8888;
var count = 0;

function start(route, handle) {
	function _onRequest(request, response) {
		var pathname = url.parse(request.url).pathname;
		var ignore = [ '/favicon.ico' ];
		if (~ignore.indexOf(pathname))
			return;
		console.log("------\nRequest [%d] received: %s", count++, pathname);
		route(handle, pathname, response, request);
	}
	;

	function _onBind(request, response) {
		console.log("Server running on: %s:%d", server, port);
	}
	;

	http.createServer(_onRequest).listen(port, server, _onBind);
};

exports.start = start;
