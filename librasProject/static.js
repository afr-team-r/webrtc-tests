var fs = require("fs");
var url = require("url");

var app = require("http").createServer(listenRequests);
var io = require('socket.io')(app);

app.listen(5000, function() { console.log("Servidor estático rodando..."); });


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
    
    //io.sockets.send({"type":"ping", "data":"blabloblu"});

	socket.on('message', function (data) {
		console.log("Received '" + JSON.stringify(data) + "': broadcasting...");
        socket.broadcast.emit('message', data);
    });	
});