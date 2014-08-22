var fs = require("fs");
var url = require("url");

var app = require("http").createServer(listenRequests);
var io = require('socket.io')(app);

app.listen(5000);


function listenRequests(req, res) {
	var pathname = url.parse(req.url).pathname;
	
	if(pathname === "/")
		pathname += "index.html";
	
    var stream = fs.createReadStream(__dirname + pathname);
	
	stream.on("error", function(err) {
		res.end();
	});
	
	stream.pipe(res);
	
}

io.on('connection', function (socket) {

	console.log("New socket: " + socket.id);

	socket.on('message', function (data) {
		console.log("Received '" + data + "': broadcasting...");
        socket.broadcast.emit('message', data);
    });
	
	socket.on('ice', function (data) {
		console.log("Received '" + data + "': broadcasting...");
        socket.broadcast.emit('ice', data);
    });
	
	socket.on('desc', function (data) {
		console.log("Received '" + data + "': broadcasting...");
        socket.broadcast.emit('desc', data);
    });	
	
});