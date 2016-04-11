"use strict";
/**
 A sample single page app using SuperLogin, MatreshkaJS, Skeleton, Formvalidation and PouchDB

 @module Matreshka Demo
 */
var Routes = require('./routes');
var Session = require('./session');
var PouchMirror = require('./pouch_mirror');
var makePopover = require('./make_popover');
/**
 * Главный класс приложения
 *
 * @class Application
 * @constructor
 */
var Application = Class({
	'extends': MK.Object,

	constructor: function () {
		//Сначала загружаем сохраненную в localStorage сессию.
		this.session = new Session(JSON.parse(localStorage.getItem('session')));
		//Затем посылаем запрос на ее обновление.
		this.session.refresh()
			.always(() => {
				//и только потом создаем страницы
				console.log('CREATE ROUTES');
				this.set('routes', new Routes(this.session))
			});
		this

			.bindNode('sandbox', '#app')
			.bindNode('routes.current', ':sandbox .page-link', {
				on: 'click',
				getValue: function (evt) {
					evt.preventDefault();
					return $(this).attr('href').substr(1);
				}
			}, {assignDefaultValue: false})
			.bindNode('routes.current', ':sandbox .page-wrap', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('active', $(this).children().attr('href').substr(1) == v);
				}
			})
			.bindNode('session.user_id', ':sandbox .not-loggedin-hidden', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('hidden', !v);
				}
			})
			.bindNode('session.user_id', ':sandbox .loggedin-hidden', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('hidden', !!v);
				}
			})
			.bindNode('session.user_id', ':sandbox .not-loggedin-disabled', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('disabled', !v);
				}
			})
			/*.bindNode('session.user_id', ':sandbox .loggedin-disabled', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('disabled', !!v);
				}
			})*/
			.linkProps('online', [
				Offline, 'state'
			], function (a) {
				return (a === 'up');
			})
			.bindNode('online', '#indicator i', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('fa-refresh', v);
					$(this).toggleClass('fa-minus-circle', !v);
				}
			})
			.bindNode('rotate', '#indicator i', MK.binders.className('my-spin'))
			.on('routes.*.dataSource@ReplicationActive', ()=> {
				console.log('routes.*.dataSource@ReplicationActive');
				if (this.rotate) return;
				this.rotate = true;
				this.stopRotate = false;
				var timerId = setInterval(() => {
					if (this.stopRotate) {
						this.rotate = false;
						this.stopRotate = false;
						clearInterval(timerId);
					}
				}, 1000);
			})
			.on('routes.*.dataSource@ReplicationPaused', ()=> {
				console.log('routes.*.dataSource@ReplicationPaused');
				this.stopRotate = true;
			})
			.on('routes.*@loginEvent', (data)=> {
				console.log('loginEvent', data);
				//set session properties
				this.session.jset(data);
				this.routes.current = this.savedCurrent ? this.savedCurrent : 'todos';
			})
			.on('routes.*@registerEvent', (data)=> {
				console.log('registerEvent', data);
				//Pass credentials of new user to login form
				this.routes.set('current', 'login', {attach: data});
			})
			.on('session@kickedEvent',
			(message = null,destroy = false)=> {
				console.log('session@kickedEvent',message);
				let user_id = this.session.user_id;
				//очищаем сессию
				this.session.each((value, key) => {
					this.session[key] = '';
				})
				//сохраняем текущую страницу
				if (this.routes && this.routes.current!='login') this.savedCurrent = this.routes.current;
				//переходим на login
				if (this.routes) this.routes.current = 'login';
				//информируем
				if (message) {
					noti.createNoti({
						message: message,
						type: "error",
						showDuration: 2
					})
				}
				//уничтожаем локальную базу если надо
				if (destroy) {
					new PouchDB('todos_' + user_id).destroy().then(()=> {
						console.log('destroy todos_' + user_id);
					})
				}
			})
			.on('routes.*@wantPage', (data)=> {
				console.log('wantPage', data);
				this.routes.current = data.substr(1);
			})
			.parseBindings();

	}
});
Offline.options = {requests: false};
Offline.check();
makePopover();
var app = new Application();
