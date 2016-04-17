"use strict";
var loginFormValidation = require('../validation/login-form');
var Page = require('./page');

var login = Class({
	'extends': Page,
	title:'Log In',
	renderer:
		`<form id="login-form">
		<h4>Log in with username and password</h4>
		<div class="row">
			<label>Username</label>
			<input class="u-full-width" name="username" type="text" placeholder="Username"/>
		</div>
		<div class="row">
			<label class="u-pull-left">
				<span>Password</span>
			</label>
			<div class="u-pull-right">
					<input type="checkbox" class="show-password"/>
					<span>Show</span>
				</div>
			<input class="u-full-width" name="password" type="password" placeholder="Password"/>
		</div>
		<div class="row">
			<a id="forgot-password" href="/forgot">Forgot Password</a>
			<div class="u-pull-right">
				<input class="button-primary" id="btn-login" type="submit" value="Log in"/>
			</div>
		</div>
	</form>
	<h4>Log in with social</h4>
	<div class="row">
			<button class="square" data-social="google"><i class="fa fa-google fa-2x" title="Google"></i></button>
			<button class="square" data-social="facebook"><i class="fa fa-facebook fa-2x" title="Facebook"></i></button>
			<button class="square" data-social="github"><i class="fa fa-github fa-2x" title="Github"></i></button>
			<button class="square" data-social="vkontakte"><i class="fa fa-vk fa-2x" title="VK"></i></button>
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
						btnLogin: ':sandbox #btn-login'
					})
					.bindNode('btnSocial', ':sandbox [data-social]', {
						on: 'click',
						getValue: function () {
							window.open('/auth/' + $(this).attr('data-social'));
						}
					}, {assignDefaultValue: false})
					.bindNode('showPassword', ':bound(password)', {
						getValue: null,
						setValue: function (v) {
							this.type = v ? 'text' : 'password';
						}
					})
					.on('click::btnLogin', function (evt) {
						evt.preventDefault();
						this.send();
					});
				loginFormValidation();
			});
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
					noti.show("Welcome "+data.user_id + "!","success");
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
					//это делает кнопку доступной (почему то?)
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
