var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

app.set('view engine', 'jade');
app.set('views', './public/views');

app.use(express.static(path.join(__dirname,'public')));

var hallMember = new Set();
var waitingList = [];
var chattingMap = {};

io.on('connection', function(socket) {
	var color = "rgb(" + Math.floor((Math.random()*255)+1) + ',' + Math.floor((Math.random()*255)+1) + ',' + Math.floor((Math.random()*255)+1) + ")";
	socket.emit('color', color);
	console.log('a user connected');
	hallMember.add(socket.id);

	socket.on('message', function(msg) {
		io.emit('chat message', msg);
	});

	socket.on('random search', function() {
		hallMember.delete(socket.id);
		socket.emit('random message', {
			color: "rgb(0,0,0)",
			text: "正在寻找小伙伴..."
		});
		if (waitingList.length > 0) {
			var stranger = waitingList.shift();
			chattingMap[socket.id] = stranger;
			chattingMap[stranger] = socket.id;
			socket.emit('random found');
			io.sockets.connected[stranger].emit('random found');
		} else {
			waitingList.push(socket.id);
		}
	});

	socket.on('random message', function(msg) {
		socket.emit('random message', msg);
		io.sockets.connected[chattingMap[socket.id]].emit('random message', msg);
	});

	socket.on('random end', function() {
		io.sockets.connected[chattingMap[socket.id]].emit('random over', {
			color: "rgb(0,0,0)",
			text: "对方已断开匹配，回到大厅"
		});
		socket.emit('random over', {
			color: "rgb(0,0,0)",
			text: "断开匹配，回到大厅"
		});
		hallMember.add(socket.id);
		hallMember.add(chattingMap[socket.id]);
		delete chattingMap[chattingMap[socket.id]];
		delete chattingMap[socket.id];
	});

	socket.on('disconnect', function() {
		if (chattingMap[socket.id]) {
			io.sockets.connected[chattingMap[socket.id]].emit('random over', {
				color: "rgb(0,0,0)",
				text: "对方已断开匹配，回到大厅"
			});
			hallMember.add(chattingMap[socket.id]);
			delete chattingMap[chattingMap[socket.id]];
			delete chattingMap[socket.id];
		} else {
			hallMember.delete(socket.id);
		}
	});
});

app.get('/', function(req, res) {
	res.render('index');
});

http.listen(3000, function() {
	console.log('listening on localhost:3000');
});