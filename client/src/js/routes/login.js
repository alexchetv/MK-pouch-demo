"use strict";
var loginFormValidation = require('../validation/login-form');
var Page = require('./page');

var login = Class({
	'extends': Page,
	title:'Login',
	renderer:
		`<form id="login-form">
		<h4>Login form</h4>
		<div class="row">
			<label>Username</label>
			<input class="u-full-width" name="username" type="text" placeholder="Username"/>
		</div>
		<div class="row">
			<label>Password</label>
			<input class="u-full-width" name="password" type="password" placeholder="Password"/>
		</div>
		<div class="row">
			<label>
				<input type="checkbox" class="show-password"/>
				<span class="label-body">Show Password</span>
			</label>
		</div>
		<div class="row">
			<input class="button-primary" id="btn-login" type="submit" value="Login"/>
		</div>
	</form>
	<div class="row">
			<input class="button-primary" id="btn-google" type="button" value="Google"/>
		</div>`,
	constructor: function (session,attach) {
		this.setTitle();
		this
			.jset({
				username: attach && attach.name ? attach.name : '',
				password: attach && attach.pass ? attach.pass : ''
			})
			.on('afterrender', function (evt) {
				console.log('login render', evt);
				this
					.bindNode({
						username: ":sandbox input[name='username']",
						password: ":sandbox input[name='password']",
						showPassword: ':sandbox .show-password',
						btnLogin: ':sandbox #btn-login',
						btnGoogle: ':sandbox #btn-google'
					})
					.bindNode('showPassword', ':bound(password)', {
						getValue: null,
						setValue: function (v) {
							this.type = v ? 'text' : 'password';
						}
					})
					.on('click::btnLogin', function (evt) {
						evt.preventDefault();
						this.send();
					})
					.on('click::btnGoogle', function (evt) {
						evt.preventDefault();
						this.google();
					});
				loginFormValidation();
			});
	},
	google:function () {
		window.open('/auth/google');
	},
	send: function () {
		$('#login-form').data('formValidation').validate();
		if ($('#login-form').data('formValidation').isValid()) {
			console.log(JSON.stringify(this.toJSON()));
			$.ajax({
				type: "POST",
				contentType: "application/json",
				url: '/auth/login',
				data: JSON.stringify(this.toJSON()),
				dataType: "json"
			})
				.done((data) =>
				{
					this.trigger('loginEvent', data);
					noti.createNoti({
						message: "Welcome "+data.user_id+"!",
						type: "success",
						showDuration: 2
					})
				})
		.fail(function (answer) {
				console.log('login fail', answer);
				$('#login-form').data('formValidation').validate();
				let message = "Error something is wrong";
				if (answer.responseJSON && answer.responseJSON.message) {
						message =  answer.responseJSON.message;
				}
				noti.createNoti({
					message: message,
					type: "error",
					showDuration: 2,
					//это делает кнопку доступной (почему?)
					onHide: function() {
						$('#login-form').data('formValidation').revalidateField('username');
					}
				})
			});
		}
		return this;
	}
});

module.exports = login;
