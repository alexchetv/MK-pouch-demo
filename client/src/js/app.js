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
		/**
		 Сессия содержит данные о текущей сессии и юзере

		  @property session
		  @type Session
		 */
		this.setClassFor('session', Session);
		//Сначала загружаем сохраненную в localStorage сессию.
		this.session = JSON.parse(localStorage.getItem('session'));
		//Затем посылаем запрос на ее обновление.
		this.session.refresh();
		this
		/**
		 * Страницы приложения
		 *
		 * @property routes
		 * @type Routes
		 */
			.set('routes', new Routes(this.session))
			.bindNode('sandbox', '#app')
			.bindNode('routes.current', ':sandbox .page-link', {
				on: 'click',
				getValue: function () {
					return $(this).attr('href').substr(1);
				}
			}, {assignDefaultValue: false})
			.bindNode('routes.current', ':sandbox .page-wrap', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('active', $(this).children().attr('href').substr(1) == v);
				}
			})
			.bindNode('session.user_id', ':sandbox .not-logged-in', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('hidden', !!v);
				}
			})
			.bindNode('session.user_id', ':sandbox .logged-in', {
				getValue: null,
				setValue: function (v) {
					$(this).toggleClass('hidden', !v);
				}
			})
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
				this.rotate=true;
				this.stopRotate=false;
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
				this.stopRotate=true;
			})
			.on('routes.*@loginEvent', (data)=> {
				console.log('loginEvent', data);
				//set session properties
				this.session = data;
				//this.store.reload(data.userDBs);
				this.routes.current = 'todos';
			})
			.on('routes.*@registerEvent', (data)=> {
				console.log('registerEvent', data);
				//Pass credentials of new user to login form
				this.routes.set('current', 'login', {attach: data});
			})
			.on('session@logoutEvent',
			(reason)=> {//(e.g. 'manual', 'expired'.'destroy')
				console.log('session@logoutEvent', this.session);
				this.session.each((value, key) => {
					this.session[key] = '';
				})
				this.routes.current = 'login';
				if (reason==='destroy') {
					new PouchDB('todos').destroy().then(()=>{
						console.log('destroy DB');
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
var app = new Application();
init();