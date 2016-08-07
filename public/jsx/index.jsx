const React = require('react');
const ReactDOM = require('react-dom');
const io = require('../js/socket.io.js');

require('../css/style.css');

var socket = io();

var ChatRoom = React.createClass({
	getInitialState: function() {
		return {message: [], color: '', login: false, name: '', random: false};
	},
	componentDidMount: function() {
		socket.addEventListener("chat message", function(msg) {
			if (this.state.random) {
				return;
			}
			var old_message = this.state.message;
			var new_message = old_message.concat([msg]);
			this.setState({message: new_message});
		}.bind(this));

		socket.addEventListener("color", function(msg) {
			this.setState({color: msg});
		}.bind(this));

		socket.addEventListener("random found", function() {
			var old_message = this.state.message;
			var new_message = old_message.concat([{
				color: "rgb(0,0,0)",
				text: "找到小伙伴了，打声招呼吧0.0"
			}]);
			this.setState({message: new_message});
		}.bind(this));

		socket.addEventListener("random message", function(msg) {
			var old_message = this.state.message;
			delete msg['name'];
			console.log(msg);
			var new_message = old_message.concat([msg]);
			this.setState({message: new_message});
		}.bind(this));

		socket.addEventListener("random over", function(msg) {
			this.setState({message: [msg], random: false});
		}.bind(this));

	},
	handleMessageSend: function(msg) {
		msg.color = this.state.color;
		msg.name = this.state.name;
		if (this.state.random) {
			socket.emit('random message', msg);
		} else {
			socket.emit('message', msg);
		}
	},
	handleLogin: function(name) {
		this.setState({name: name, login: true});
	},
	handleStateChange: function(state) {
		if (state == 'random' && !this.state.random) {
			this.setState({message: [], random: true});
			socket.emit('random search');
		} else if (state == 'hall' && this.state.random) {
			// this.setState({message: [], random: true});
			socket.emit('random end');
		}
	},
	render: function() {
		if (this.state.login) {
			return (
				<div className="chat-room">
					<NavList onStateChange={this.handleStateChange} username={this.state.name} />
					<MessageBox message={this.state.message} textColor={this.state.color} />
					<MessageForm onMessageSend={this.handleMessageSend} />
				</div>
			);
		} else {
			return (
				<div className="chat-room">
					<LoginBox onLogin={this.handleLogin} />
				</div>
			);
		}
	}
});

var LoginBox = React.createClass({
	getInitialState: function() {
		return {text: ''};
	},
	handleTextChange: function(e) {
		this.setState({text: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		this.props.onLogin(this.state.text);
		this.setState({text: ''});
	},
	render: function() {
		return (
			<div className="loginBox">
				<form className="loginForm" onSubmit={this.handleSubmit}>
					<input
						type="text"
						placeholder="请输入你的ID"
						onChange={this.handleTextChange}
						value={this.state.text}
						maxLength="4"
					/>
					<input
						type="submit"
					/>
				</form>
			</div>
		);
	}
});

var NavList = React.createClass({
	changeToMatching: function(e) {
		e.preventDefault();
		this.props.onStateChange('random');
	},
	changeToHall: function(e) {
		e.preventDefault();
		this.props.onStateChange('hall');
	},
	render: function() {
		return (
			<nav className="nav-list">
				<h3>{this.props.username}</h3>
				<ul>
					<li><a href="#" onClick={this.changeToHall}>大厅</a></li>
					<li><a href="#" onClick={this.changeToMatching}>匿名匹配</a></li>
				</ul>
			</nav>
		);
	}
});

var MessageBox = React.createClass({
	render: function() {
		var key = 0;
		var message_lists = this.props.message.map(function(message) {
			if (message.name) {
				return (
					<li key={key++} style={{color: message.color}}>{message.name}: {message.text}</li>
				);
			} else {
				return (
					<li key={key++} style={{color: message.color}}>{message.text}</li>
				);	
			}
		}.bind(this));
		return (
			<div className="message-box">
				<ul className="message-list">
					{message_lists}
				</ul>
			</div>
		);
	}
});

var MessageForm = React.createClass({
	getInitialState: function() {
		return {text: ''};
	},
	handleTextChange: function(e) {
		this.setState({text: e.target.value});
	},
	handleSubmit: function(e) {
		e.preventDefault();
		var text = this.state.text.trim();
		if (!text) {
			return;
		}
		this.props.onMessageSend({text: text});
		this.setState({text: ''});
	},
	render: function() {
		return (
			<form className="message-form" onSubmit={this.handleSubmit}>
				<input
					type="text"
					placeholder="冒个泡吧"
					onChange={this.handleTextChange}
					value={this.state.text}
				/>
				<input
					type="submit"
				/>
			</form>
		);
	}
});

ReactDOM.render(
	<ChatRoom url="/" />,
	document.getElementById("content")
);