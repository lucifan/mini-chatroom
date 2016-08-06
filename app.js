var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.set('view engine', 'jade');
app.set('views', './public/views');

app.use(express.static(path.join(__dirname,'public')));

var randomList = [];

io.on('connection', function(socket) {
	var color = "rgb(" + Math.floor((Math.random()*255)+1) + ',' + Math.floor((Math.random()*255)+1) + ',' + Math.floor((Math.random()*255)+1) + ")";
	socket.emit('color', color);
	console.log('a user connected');
	socket.on('message', function(msg) {
		io.emit('chat message', msg);
	});
	socket.on('random', function() {
		// randomList.push(this);
	});
});

app.get('/', function(req, res) {
	res.render('index');
});

http.listen(3000, function() {
	console.log('listening on localhost:3000');
});