"use strict";
var Routes = require('./routes');
var Session = require('./session');
var PouchMirror = require('./pouch_mirror');
var init = require('./init');


/*****************************************************************
 * Store


 var Store = Class({
	'extends': MK.Array,
	Model: PouchMirror,
	constructor: function (data) {
		"use strict";

	this.reload: function (DBs) {
		console.log('reload');
		this.recreate();
		for (var db in DBs) {
			console.log("DBs." + db + " = " + DBs[db]);
			this.push({remote: DBs[db], local: db});
		}
	}
});
*/
/*****************************************************************
 * Application
 */

var Application = Class({
	'extends': MK.Object,

	constructor: function () {
		this
			//.jset('online', Offline.state == 'up')
			.setClassFor('session', Session)
			.set('routes', new Routes(this.session))
			//.set('store', new Store())
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
				return (a === 'up') ? true:false;
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
/*

 init: function() {
 this._super(...arguments);
 console.log('replicatingOninit');
 let appAdapter = this.get('store').adapterFor('application');
 appAdapter.on('ReplicationActive', function() {
 if (this.get('synch')) return;
 this.set('synch',true);
 this.set('stopspin',false);
 var timerId = setInterval(function() {
 if (this.stopspin) {
 this.set('synch',false);
 this.set('stopspin',false);
 clearInterval(timerId);
 }
 }.bind(this), 1000);
 }.bind(this));
 appAdapter.on('ReplicationPaused',function() {
 console.log('replicatingOff',this.synch);
 this.set('stopspin',true);
 }.bind(this));
 },



			*/
			.on('session@userEvent', (uid) => {
				console.log('userEvent', uid)
				this.routes.set('loggedIn', !!uid);
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
			(reason)=> {//explain why the user was logged out (e.g. 'manual', 'expired')
				console.log('session@logoutEvent', this.session);
				this.session.each((value, key) => {
					this.session[key] = '';
				})
				this.routes.current = 'login';
			})
			.on('routes.*@wantPage', (data)=> {
				console.log('wantPage', data);
				this.routes.current = data.substr(1);
			})
			.parseBindings();
		//recreate session from the one previously saved in localStorage
		this.session = JSON.parse(localStorage.getItem('session'));
		//then refresh it
		this.session.refresh();
	}
});
Offline.options = {requests: false};
Offline.check();
var app = new Application();
init();