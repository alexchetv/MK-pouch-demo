"use strict";
var Page = require('./page');
var profileFormValidation = require('../validation/profile-form');

var profile = Class({
	'extends': Page,
	title: 'Profile',
	renderer: `<div>
		<h4>Profile</h4>
		<div id="view">
		<div class="row">
			<span>Email (confirmed) <strong>{{email}}</strong></span>
			<a class="u-pull-right" id="edit-email" href="edit-email">{{addOrEdit}}</a>
		</div>
		<div class="row">
			<span>Password <strong>******</strong></span>
			<a class="u-pull-right" id="edit-password" href="edit-password">Change</a>
		</div>
		<div class="row">
			<span>Current session expired <strong>{{sessionExpired}}</strong></span>
			<a class="u-pull-right" id="refr" href="refresh">Refresh</a>
		</div>
		<div class="row">
			<span>Active session <strong>{{sessions}}</strong></span>
			<span class="u-pull-right">
			<a id="close-others" href="close-others">Close Others</a>&nbsp;
			<a id="close-all" href="close-all">Close All</a>
			</span>
		</div>
		<div class="row">
				<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>&nbsp;<a id="remove-user" href="remove-user">Remove User</a>
		</div>
		</div>
		<form id="profile-form" class="hidden">
		<div class="row only-pass">
			<label>Current Password</label>
			<input class="u-full-width" name="current" type="password" placeholder="Current Password"/>
		</div>
		<div class="row only-pass">
			<label>New Password</label>
			<input class="u-full-width" name="password" type="password" placeholder="Password"/>
		</div>
		<div class="row only-pass">
			<label>Confirm New Password</label>
			<input class="u-full-width" name="confirm" type="password" placeholder="Confirm Password"/>
		</div>
		<div class="row only-pass">
			<label>
				<input type="checkbox" class="show-password"/>
				<span class="label-body">Show Password</span>
			</label>
		</div>
		<div class="row only-email">
			<label>New Email</label>
			<input class="u-full-width" name="email" type="text" placeholder="New Email"/>
		</div>
		<div class="row">
			<div class="u-pull-right">
				<input class="btn-cancel" type="button" value="Cancel"/>
				<input class="button-primary" id="btn-save" type="submit" value="Save"/>
			</div>
		</div>
	</form>
	</div>`,
	constructor: function (session) {
		this
			.set({
				mode: 'view',
				newEmail: ''
			})
			.jset({
				currentPassword: '',
				newPassword: '',
				confirmPassword: ''
			});
		this.getProfile(session);
		this.on('afterrender', () => {
			this.setTitle(session.user_id);
			this
				.linkProps(
				'sessionExpired', [session, 'expires'],
				function (a) {
					return (a ? new Date(a).toLocaleString() : '')
				})
				.linkProps('addOrEdit', 'email',
				function (a) {
					return (a ? 'Change' : 'Add')
				})
				.linkProps('manySessions', 'sessions',
				function (a) {
					return (a > 1);
				})
				.bindNode({refresh: ':sandbox #refr'})
				.on('click::refresh', (evt) => {
					evt.preventDefault();
					session.refresh();
				})
				.bindNode({editEmail: ':sandbox #edit-email'})
				.on('click::editEmail', (evt) => {
					evt.preventDefault();
					this.set('mode', 'editEmail');
				})
				.bindNode({editPassword: ':sandbox #edit-password'})
				.on('click::editPassword', (evt) => {
					evt.preventDefault();
					this.set('mode', 'editPassword');
				})
				.bindNode({closeAll: ':sandbox #close-all'})
				.on('click::closeAll', (evt) => {
					evt.preventDefault();
					session.authAjax('POST', '/auth/logout-all')
						.then(()=> {
							this.getProfile(session);
						});
				})
				.bindNode({closeOthers: ':sandbox #close-others'})
				.on('click::closeOthers', (evt) => {
					evt.preventDefault();
					session.authAjax('POST', '/auth/logout-others')
						.then(()=> {
							this.getProfile(session);
						});
				})
				.bindNode({removeUser: ':sandbox #remove-user'})
				.on('click::removeUser', (evt) => {
					evt.preventDefault();
					if (session.user_id == prompt("All your data will be destroyed. If You are really sure, type your username and press OK", '')) {
						session.authAjax('POST', '/user/destroy')
							.then(()=> {
								let m = "User " + session.user_id + " removed";
								session.trigger('kickedEvent',m,true);
							});
					} else {
						noti.createNoti({
							message: 'User deletion was canceled.',
							type: "warning",
							showDuration: 2
						})
					}

				})
				.bindNode('mode', '#profile-form', {
					getValue: null,
					setValue: function (v) {
						$(this).toggleClass('hidden', v == 'view');
					}
				})
				.bindNode('mode', '#view', {
					getValue: null,
					setValue: function (v) {
						$(this).toggleClass('hidden', v != 'view');
					}
				})
				.bindNode('mode', '.only-pass', {
					getValue: null,
					setValue: function (v) {
						$(this).toggleClass('hidden', v != 'editPassword');
					}
				})
				.bindNode('mode', '.only-email', {
					getValue: null,
					setValue: function (v) {
						$(this).toggleClass('hidden', v != 'editEmail');
					}
				})
				.bindNode({
					btnCancel: ':sandbox .btn-cancel',
					currentPassword: ":sandbox input[name='current']",
					newPassword: ":sandbox input[name='password']",
					confirmPassword: ":sandbox input[name='confirm']",
					showPassword: ':sandbox .show-password',
					btnSave: ':sandbox #btn-save',
					newEmail: ":sandbox input[name='email']"
				})
				.bindNode('showPassword', ":sandbox [name='password'],[name='confirm'],[name='current']", {
					getValue: null,
					setValue: function (v) {
						this.type = v ? 'text' : 'password';
					}
				})
				.on('click::btnSave', function (evt) {
					evt.preventDefault();
					$('#profile-form').data('formValidation').validate();
					if ($('#profile-form').data('formValidation').isValid()) {
						if (this.mode == 'editPassword') {
							this.savePassword(session);
						} else {
							this.saveEmail(session);
						}
					}
				})
				.on('click::btnCancel', (evt) => {
					this.cancel();
				})
				.bindNode({
					manySessions: ':bound(closeOthers)'
				}, MK.binders.display(true)
			);
			this.parseBindings();
			profileFormValidation();
		})
	},
	cancel:function(){
		$('#profile-form').data('formValidation').resetForm();
		this.set({
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
			newEmail: '',
			showPassword: false,
			mode:'view'
		});

	},
	saveEmail: function (session) {
		session.authAjax('POST', '/auth/change-email', JSON.stringify({newEmail:this.newEmail}))
			.done((data) => {
				this.cancel();
				noti.createNoti({
					message: "Email changed. Please confirm your new email address",
					type: "warning",
					showDuration: 5
				})
			})
			.fail((answer) => {
				console.error('emailChange fail', answer);
			});
	},
	savePassword: function (session) {
		session.authAjax('POST', '/auth/password-change', JSON.stringify(this.toJSON()))
			.done((data) => {
				this.cancel();
				noti.createNoti({
					message: "Password successfully changed",
					type: "success",
					showDuration: 2
				})
			})
			.fail((answer) => {
				console.error('passwordChange fail', answer);
			});
	},
	getProfile: function (session) {
		session.authAjax('GET', '/user/profile')
			.done((data) => {
				console.log('getProfile', data);
				this.jset(data);
			})
			.fail((answer) => {
				console.error('getProfile fail', answer);
			});
	}

});

module.exports = profile;