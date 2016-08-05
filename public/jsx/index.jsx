const React = require('react');
const ReactDOM = require('react-dom');
const io = require('../js/socket.io.js');

require('../css/style.css');

var socket = io();

var ChatRoom = React.createClass({
	getInitialState: function() {
		return {message: [], color: '', login: false, name: ''};
	},
	componentDidMount: function() {
		socket.addEventListener("chat message", function(msg) {
			var old_message = this.state.message;
			var new_message = old_message.concat([msg]);
			this.setState({message: new_message});
		}.bind(this));
		socket.addEventListener("color", function(msg) {
			this.setState({color: msg});
		}.bind(this));
	},
	handleMessageSend: function(msg) {
		msg.color = this.state.color;
		msg.name = this.state.name;
		socket.emit('message', msg);
	},
	handleLogin: function(name) {
		alert('login!');
		this.setState({name: name, login: true});
	},
	render: function() {
		if (this.state.login) {
			return (
				<div className="chat-room">
					<NavList username={this.state.name} />
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
		alert('submit!');
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
	render: function() {
		return (
			<nav className="nav-list">
				<h3>{this.props.username}</h3>
				<ul>
					<li><a href="#">大厅</a></li>
				</ul>
			</nav>
		);
	}
});

var MessageBox = React.createClass({
	render: function() {
		var key = 0;
		var message_lists = this.props.message.map(function(message) {
			return (
				<li key={key++} style={{color: message.color}}>{message.name}: {message.text}</li>
			);
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