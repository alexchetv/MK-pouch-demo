var Page = require('./page');

var registerFormValidation = require('../validation/register-form');
var register = Class({
	'extends': Page,
	title:'Sign Up',
	renderer:`<form id="register-form">
		<h4>Sign up</h4>

		<div class="row">
			<label>Name</label>
			<input class="u-full-width" name="name" type="text" placeholder="Name"/>
		</div>
		<div class="row">
			<label>Email</label>
			<input class="u-full-width" name="email" type="text" placeholder="Email"/>
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
			<label>Confirm Password</label>
			<input class="u-full-width" name="confirm" type="password" placeholder="Confirm Password"/>
		</div>
		<div class="row">
			<div class="u-pull-right">
				<input class="button-primary" id="btn-register" type="submit" value="Sign up"/>
			</div>
		</div>
	</form>`,
	constructor: function () {
		this.setTitle();
		this
			.jset({
				name: '',
				password: '',
				confirmPassword: '',
				email: ''
			})
			.on('afterrender', function (evt) {
				console.log('register render', evt);
				this
					.bindNode({
						name: ":sandbox input[name='name']",
						email: ":sandbox input[name='email']",
						password: ":sandbox input[name='password']",
						confirmPassword: ":sandbox input[name='confirm']",
						showPassword: ':sandbox .show-password',
						btnRegister: ':sandbox #btn-register'
					})
					.bindNode('showPassword', ":sandbox [name='password'],[name='confirm']", {
						getValue: null,
						setValue: function (v) {
							this.type = v ? 'text' : 'password';
						}
					})
					.on('click::btnRegister', function (evt) {
						evt.preventDefault();
						this.send();
					});
				registerFormValidation();
			});
	},
	send: function () {
		$('#register-form').data('formValidation').validate();
		if ($('#register-form').data('formValidation').isValid()) {
			console.log(JSON.stringify(this.toJSON()));
			$.ajax({
				type: "POST",
				contentType: "application/json",
				url: '/auth/register',
				data: JSON.stringify(this.toJSON()),
				dataType: "json"
			})
				.done((data) => {
					this.trigger('registerEvent');
				})
				.fail(function (answer) {
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
							$('#register-form').data('formValidation').revalidateField('name');
						}
					})
				});
		}
		return this;
	}
});

module.exports = register;