/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Routes = __webpack_require__(1);
	var Session = __webpack_require__(11);
	var PouchMirror = __webpack_require__(4);
	var init = __webpack_require__(12);


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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Todos = __webpack_require__(2);
	var profile = __webpack_require__(5);
	var login = __webpack_require__(6);
	var register = __webpack_require__(8);
	var lost = __webpack_require__(10);

	var routesList = {
		/* Todos*/
		todos : {
			creator: Todos,
			restricted: true
		},
		/* Profile*/
		profile : {
			creator: profile,
			restricted: true
		},
		/* LoginForm*/
		login : {
			creator: login,
			restricted: false
		},
		/* RegisterForm */
		register : {
			creator: register,
			restricted: false
		},
		/* Page Not Found*/
		lost : {
			creator: lost,
			restricted: false
		},
	}

	var Routes = Class({
		'extends': MK.Array,
		itemRenderer: function () {
			console.log('itemRenderer',this.current);
			return '#' + this.current + '-template';
		},
		constructor: function (session) {
			this
				.set('loggedIn',false)
				.bindNode('sandbox', '#page-content')
				.onDebounce('change:current', (evt) => {
					console.log('change:routes.current', this.loggedIn, this.current,evt.attach);
					this.recreate();
					if (this.current) {
						if (routesList.hasOwnProperty(this.current)) {
							if (!this.loggedIn && routesList[this.current].restricted) {
								this.current = 'login';
							} else {
								this.push(new routesList[this.current].creator(session,evt.attach));//передаем сессию и аттачмент
							}
						} else {
							this.current = 'lost';
						}
					} else {
						this.current = 'todos';
					}
				}, 100);
			this.initRouter('current', 'history');
		}
	});

	module.exports = Routes;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Todo = __webpack_require__(3);
	var PouchMirror = __webpack_require__(4);

	var Todos = Class({
		'extends': MK.Array,
		Model: Todo,
		itemRenderer: '#todo-item-template',
		constructor: function (session) {
			this.set('DBs', session.userDBs);
			if (this.DBs.todos) {
				this.set('dataSource', new PouchMirror(
					{
						local: 'todos',
						remote: this.DBs.todos,
						type: 'todo',
						remoteOptions: {
							auto_compaction: true
						}
					}
				));
			} else {
				session.trigger('logoutEvent', 'No Database');
			}
			this.on('dataSource@dbReady', (data) => {
				console.log('dataSource@dbReady', data);
				this.recreate(data);
			});
			this.on('dataSource@dbUpdate', (doc) => {
				console.log('dataSource@dbUpdate', doc);
				for (let index = this.length - 1; index >= 0; index--) {
					let todo = this[index];
					console.log('each', todo);
					if (doc._id === todo._id) {
						if (doc._deleted) {
							this.pull(index);
						} else {
							todo._rev = doc._rev;
							todo.title = doc.title;
							todo.complete = doc.complete;
						}
						doc = null;
						break;
					}
				}
				if (doc && !doc._deleted) {
					this.push(new Todo(doc, this));
				}

			});
			this
				.on('afterrender', function (evt) {
					console.log('todos render', evt);
					this
						.bindNode('container', '#todo-list')
						.bindNode('newTodo', ':sandbox .new-todo')
				})
				.on('*@editEvent', function (item) {
					console.log('editEvent', item);
					this.editingTodo = item;
				})
				.on('beforechange:editingTodo', () => {
					//console.log('change:editingTodo', evt);
					//if (evt.previousValue) evt.previousValue.editing = false;
					if (this.editingTodo) this.editingTodo.editing = false;
				})
				.on('change:editingTodo',  () => {
					//console.log('change:editingTodo', evt);
					//if (evt.previousValue) evt.previousValue.editing = false;
					if (this.editingTodo) this.editingTodo.editing = true;
				})
				.on('focus::newTodo', function (evt) {
					this.editingTodo = null;
				})
				.on('keyup::newTodo', function (evt) {
					var newValue;
					if (evt.which === 27) {
						this.newTodo = '';
					} else if (evt.which === 13) {
						if (newValue = this.newTodo.trim()) {
							this.dataSource.put({
								title: newValue,
								complete: false
							}, 'todo').then(function (response) {
								console.log('response', response);
							}).catch(function (err) {
								console.log('err', err);
							});
							this.newTodo = '';
						}
					}
				});
		}
	});

	module.exports = Todos;

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	var Todo = Class({
		'extends': MK.Object,
		constructor: function (data, parent) {
			this
				.jset({
					_id:data._id,
					title: data.title || '',
					complete: data.complete || false,
					_rev:data._rev
				})
				.on('render', function (evt) {
					console.log('todo render', evt);
					this
						.bindNode('title', ':sandbox label', MK.binders.html())
						.bindNode('complete', ':sandbox', MK.binders.className('complete'))
						.bindNode('editing', ':sandbox', MK.binders.className('editing'))
						.bindNode('edit',':sandbox .edit')
						.bindNode('destroy', ':sandbox .destroy')
						.bindNode('done', ':sandbox .done')
				})
				.on('dblclick::title', () =>{
					this.trigger('editEvent',this);
				})
				.on('change:editing',() => {
					if (this.editing) {
						this.edit = this.title;
						this.$bound('edit').focus();
					}
				})
				.on('keyup::edit', function(evt) {
					var editValue;
					if (evt.which === 27) {
						this.trigger('editEvent',null);
					} else if (evt.which === 13) {
						if (editValue = this.edit.trim()) {
							//this.title = editValue;
							parent.dataSource.put({
								title: editValue,
								complete:this.complete,
								_id:this._id,
								_rev:this._rev
							}).then((response) => {
								console.log('response',response);
								this.edit = '';
								this.trigger('editEvent',null);
							}).catch( (err) => {
								console.log('err',err);
							});
						} else {
							parent.dataSource.pull(JSON.stringify(this));
						}
					}
				})
				.on('click::destroy', function() {
					console.log('click::destroy');
					parent.dataSource.pull(JSON.stringify(this));
				})
				.on('click::done', function() {
					console.log('click::done');
					parent.dataSource.put({
						title: this.title,
						complete:!this.complete,
						_id:this._id,
						_rev:this._rev
					}).then((response) => {
						console.log('response',response);
					}).catch( (err) => {
						console.log('err',err);
					});
				});
		}
	});
	module.exports = Todo;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';
	var PouchMirror = Class({
		'extends': MK.Object,

		constructor: function (data) {
			Offline.options = {requests: false};
			Offline.check();
			this
				.linkProps('online', [
					Offline, 'state'
				], function (a) {
					console.log('Offline change',a);
					return (a === 'up') ? true:false;
				})
				.on('change:online',(evt) =>{
					//console.log('online change',evt);
					if(this.online) this.startSync(); else this.stopSync();
				})
				.set('db', new PouchDB(data.local + '_mem', {adapter: 'memory', auto_compaction: true}))
				.set('diskDb', new PouchDB(data.local, {auto_compaction: true}))
				.set('type', data.type)
				.set('syncing', false) //
				.set('stopped', true)
				.set('status', 'stopped')
				.set('active', false)//true when the db is actively sending or receiving changes, otherwise false
				.set('ready', false);//true when the initial sync has completed, otherwise false
			if (data.remote) this.set('remoteDb', new PouchDB(data.remote, data.remoteOptions));
			// First copy the diskDb to memory, and then sync changes in memory to diskDb
			this.diskDb.replicate.to(this.db).then(() => {
				this.db.replicate.to(this.diskDb, {live: true});
				this.db.allDocs({
					include_docs: true,
					attachments: true,
					startkey: this.type,
					endkey: this.type + '\uffff'
				}).then((data)=> {
					this.trigger('dbReady', data.rows.map((item)=> {
						return item.doc
					}));
				})

				this.change = this.db.changes({
					since: 'now',
					live: true,
					include_docs: true
				}).on('change', (change) => {
					console.log('dbChange', change);
					this.trigger('dbUpdate', change.doc);


				}).on('complete', (info) => {
					console.log('dbComplete', info);
				}).on('error', (err) => {
					console.log('dbError', err)
				});

				this.startSync();
			});
		},//constructor end

		startSync: function () {
			if (!this.remoteDb || !this.online) return;
			console.log('START REPLICATION');
			this.sync = PouchDB.sync(this.db, this.remoteDb, {live: true, retry: true})
				.on('change', this.onChange.bind(this))
				.on('paused', this.onPaused.bind(this))
				.on('active', this.onActive.bind(this))
				.on('denied', this.onDenied.bind(this))
				.on('complete', this.onComplete.bind(this))
				.on('error', this.onError.bind(this));
		},
		stopSync: function () {
			if (this.sync) {
				this.sync.cancel();
				console.log('STOP REPLICATION');
			}
		},
		onChange: function (info) {
			console.log('onChange', info.change.docs);
		},
		onError: function (err) {
			console.log('onError');
			this.trigger('ReplicationError', {"err": err});
		},
		onPaused: function () {
			console.log('onPaused');
			this.trigger('ReplicationPaused');
		},
		onActive: function () {
			console.log('onActive');
			this.trigger('ReplicationActive');
		},
		onDenied: function (err) {
			console.log('onDenied');
			this.trigger('ReplicationDenied', {"err": err});
		},
		onComplete: function (info) {
			console.log('onComplete');
			this.trigger('ReplicationComplete', {"info": info});
		},

		put: function (data, type) {
			if (!data._id) data._id = this.timeStampId(type);
			return this.db.put(data);
		},

		pull: function (data) {
			console.log('pull', data);
			return this.db.remove(JSON.parse(data));

		},

		timeStampId: function (docType) {
			if (!docType) {
				throw new SyntaxError("Need document type to create document ID");
			}
			var timestamp = Date.now();
			return docType + ':' + new Date(timestamp).toISOString() + ':' + this.base64Bytes(4);
		},
		base64Bytes: function (length) {
			var URLSafeBase64 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
			var result = '';
			for (var i = 0; i < length; i++) {
				var rand = Math.floor(Math.random() * 64);
				result += URLSafeBase64.charAt(rand);
			}
			return result;
		}
	});

	/*
	 this.stopped = false;
	 if (this.online && !this.syncing) {
	 this.remoteSync = PouchDB.sync(this.remoteDb, this.db, {live: true, retry: true})
	 .on('active', () => {
	 this.active = true;
	 //$rootScope.$broadcast('pm:update', localDbName, 'active', getStatus());
	 })
	 .on('paused', () => {
	 this.active = false;
	 if (!this.ready) {
	 console.log('db',this.db);
	 this.ready = true;
	 //$rootScope.$broadcast('pm:update', localDbName, 'ready', getStatus());
	 }
	 //$rootScope.$broadcast('pm:update', localDbName, 'paused', getStatus());

	 })
	 .on('complete', (info) => {
	 // This means the sync was cancelled
	 this.active = false;
	 this.syncing = false;
	 // These should show up under the 'error' handler but PouchDB is firing 'complete' instead
	 if (checkUnauthorized(info)) {
	 this.status = 'error';
	 //$rootScope.$broadcast('pm:error', localDbName, {error: 'unauthorized'}, getStatus(), info);
	 } else {
	 this.status = 'stopped';
	 //$rootScope.$broadcast('pm:update', localDbName, 'stopped', getStatus(), info);
	 }
	 })
	 .on('denied', (err) => {
	 // Access denied
	 //$rootScope.$broadcast('pm:denied', localDbName, err, getStatus());
	 })
	 .on('error', (err) => {
	 this.active = false;
	 this.status = 'error';
	 //$rootScope.$broadcast('pm:error', localDbName, err, getStatus());
	 });
	 this.syncing = true;
	 this.status = 'syncing';
	 } else {
	 if (!this.online) {
	 this.status = 'offline';
	 }
	 if (!this.ready) {
	 this.ready = true;
	 //$rootScope.$broadcast('pm:update', localDbName, 'ready', getStatus());
	 }
	 }
	 }

	 */

	module.exports = PouchMirror;

	/*function tttt(angular, PouchDB) {
	 'use strict';
	 /* global angular, PouchDB */
	/* jshint -W097

	 angular.module('pouchMirror', [])

	 .run(["$window", "$rootScope", function ($window, $rootScope) {
	 $rootScope.online = $window.navigator.onLine;
	 $window.addEventListener("offline", function () {
	 $rootScope.online = false;
	 $rootScope.$broadcast('offline');
	 });
	 $window.addEventListener("online", function () {
	 $rootScope.online = true;
	 $rootScope.$broadcast('online');
	 });
	 }])

	 .factory('PouchMirror', ["$rootScope", "$q", function ($rootScope, $q) {
	 return function (localDbName, remoteUrl, remoteOptions) {
	 var memoryDb, diskDb, remoteDb, remoteSync;
	 var syncing = false;
	 var stopped = true;
	 var status = 'stopped';
	 var active = false, ready = false;
	 remoteOptions = remoteOptions || {};
	 if (!localDbName) {
	 localDbName = 'pouch';
	 }

	 memoryDb = new PouchDB(localDbName + '_mem', {adapter: 'memory'});
	 diskDb = new PouchDB(localDbName);
	 diskDb.replicate.to(memoryDb).then(function () {
	 memoryDb.replicate.to(diskDb, {live: true});
	 startSync();
	 });

	 $rootScope.$on('online', function () {
	 if (!stopped) {
	 startSync();
	 }
	 });
	 $rootScope.$on('offline', function () {
	 if (!stopped) {
	 status = 'offline';
	 }
	 pauseSync();
	 });

	 memoryDb.startSync = startSync;
	 memoryDb.stopSync = stopSync;
	 memoryDb.syncStatus = getStatus;
	 memoryDb.destroyLocal = destroyLocal;

	 return memoryDb;

	 function getStatus() {
	 return {
	 status: status,
	 active: active,
	 ready: ready
	 };
	 }

	 function startSync() {
	 stopped = false;
	 if (remoteUrl && $rootScope.online && !syncing) {
	 if (!remoteDb) {
	 remoteDb = new PouchDB(remoteUrl, remoteOptions);
	 }
	 remoteSync = PouchDB.sync(remoteDb, memoryDb, {live: true, retry: true})
	 .on('active', function () {
	 active = true;
	 $rootScope.$broadcast('pm:update', localDbName, 'active', getStatus());
	 })
	 .on('paused', function () {
	 active = false;
	 if (!ready) {
	 ready = true;
	 $rootScope.$broadcast('pm:update', localDbName, 'ready', getStatus());
	 }
	 $rootScope.$broadcast('pm:update', localDbName, 'paused', getStatus());

	 })
	 .on('complete', function (info) {
	 // This means the sync was cancelled
	 active = false;
	 syncing = false;
	 // These should show up under the 'error' handler but PouchDB is firing 'complete' instead
	 if (checkUnauthorized(info)) {
	 status = 'error';
	 $rootScope.$broadcast('pm:error', localDbName, {error: 'unauthorized'}, getStatus(), info);
	 } else {
	 status = 'stopped';
	 $rootScope.$broadcast('pm:update', localDbName, 'stopped', getStatus(), info);
	 }
	 })
	 .on('denied', function (err) {
	 // Access denied
	 $rootScope.$broadcast('pm:denied', localDbName, err, getStatus());
	 })
	 .on('error', function (err) {
	 active = false;
	 status = 'error';
	 $rootScope.$broadcast('pm:error', localDbName, err, getStatus());
	 });
	 syncing = true;
	 status = 'syncing';
	 } else {
	 if (!$rootScope.online) {
	 status = 'offline';
	 }
	 if (!ready) {
	 ready = true;
	 $rootScope.$broadcast('pm:update', localDbName, 'ready', getStatus());
	 }
	 }
	 }

	 // Called when an offline status is detected
	 function pauseSync() {
	 if (syncing) {
	 remoteSync.cancel();
	 syncing = false;
	 }
	 }

	 // Manually stop the sync regardless of offline status
	 function stopSync() {
	 stopped = true;
	 status = 'stopped';
	 ready = 'false';
	 pauseSync();
	 }

	 // Destroys both the Disk and Memory databases
	 function destroyLocal() {
	 stopSync();
	 return $q.all([diskDb.destroy(), memoryDb.destroy()]);
	 }

	 function checkUnauthorized(info) {
	 var unauthorized = false;
	 if (info.push && info.push.errors) {
	 info.push.errors.forEach(function (err) {
	 if (err.name === 'unauthorized' || err.name === 'forbidden') {
	 unauthorized = true;
	 }
	 });
	 }
	 if (info.pull && info.pull.errors) {
	 info.pull.errors.forEach(function (err) {
	 if (err.name === 'unauthorized' || err.name === 'forbidden') {
	 unauthorized = true;
	 }
	 });
	 }
	 return unauthorized;
	 }

	 };
	 }]);
	 }*/


/***/ },
/* 5 */
/***/ function(module, exports) {

	var profile = Class({
		'extends': MK.Object,
		constructor: function () {
		}
	});

	module.exports = profile;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var loginFormValidation = __webpack_require__(7);
	var login = Class({
		'extends': MK.Object,
		constructor: function (session,attach) {
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
					{this.trigger('loginEvent', data);
					})
			/*.fail(function (answer) {
					console.log('login fail', answer);
					//if (answer.status==401) me.trigger('logoutEvent','expired')
				})*/;
			}
			return this;
		}
	});

	module.exports = login;


/***/ },
/* 7 */
/***/ function(module, exports) {

	var loginFormValidation = function() {
		$('#login-form').formValidation({
			framework: 'skeleton',
			autoFocus: false,
			icon: {
				valid: 'fa fa-check',
				invalid: 'fa fa-times',
				validating: 'fa fa-refresh',
				feedback: 'fv-control-feedback'
			},
			fields: {
				username: {
					verbose: false,
					validators: {
						notEmpty: {
							message: 'The username is required'
						},
						stringLength: {
							min: 3,
							max: 16,
							message: 'The username must be more than 3 and less than 16 characters long'
						},
						regexp: {
							regexp: /^[a-zA-Z0-9_-]+$/,
							message: 'The username can only consist of alphabetical, number, underscore and hyphen'
						}
					}
				},
				password: {
					validators: {
						notEmpty: {
							message: 'The password is required'
						},
						stringLength: {
							min: 6,
							max: 20,
							message: 'The password must be more than 6 and less than 20 characters long'
						}
					}
				}
			}
		});
	}

	module.exports = loginFormValidation;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var registerFormValidation = __webpack_require__(9);
	var register = Class({
		'extends': MK.Object,
		constructor: function () {
			this
				.jset({
					username: '',
					password: '',
					confirmPassword: '',
					email: ''
				})
				.on('afterrender', function (evt) {
					console.log('register render', evt);
					this
						.bindNode({
							username: ":sandbox input[name='username']",
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
					.done((data) =>
					{this.trigger('registerEvent', {name:this.username,pass:this.password});
						console.log('trigger registerEvent',data);
					})
			}
			return this;
		}
	});

	module.exports = register;

/***/ },
/* 9 */
/***/ function(module, exports) {

	var registerFormValidation = function() {
		$('#register-form').formValidation({
			framework: 'skeleton',
			autoFocus: false,
			icon: {
				valid: 'fa fa-check',
				invalid: 'fa fa-times',
				validating: 'fa fa-refresh',
				feedback: 'fv-control-feedback'
			},
			fields: {
				username: {
					verbose: false,
					validators: {
						notEmpty: {
							message: 'The username is required'
						},
						stringLength: {
							min: 3,
							max: 16,
							message: 'The username must be more than 3 and less than 16 characters long'
						},
						regexp: {
							regexp: /^[a-zA-Z0-9_-]+$/,
							message: 'The username can only consist of alphabetical, number, underscore and hyphen'
						},
						remote: {
							validKey: 'ok',
							message: 'The username is not available',
							url: function (validator) {
								return '/auth/validate-username/' + validator.getFieldElements('username').val();
							},
							type: 'GET'
						}
					}
				},
				email: {
					verbose: false,
					validators: {
						notEmpty: {
							message: 'The email is required'
						},
						regexp: {
							regexp: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,6}$/,
							message: 'The email address is not valid'
						},
						remote: {
							validKey: 'ok',
							message: 'The email is not available',
							url: function (validator) {
								return '/auth/validate-email/' + validator.getFieldElements('email').val();
							},
							type: 'GET'
						}
					}
				},
				password: {
					validators: {
						notEmpty: {
							message: 'The password is required'
						},
						stringLength: {
							min: 6,
							max: 20,
							message: 'The password must be more than 6 and less than 20 characters long'
						}
					}
				},
				confirm: {
					validators: {
						notEmpty: {
							message: 'Please retype the password'
						},
						identical: {
							field: 'password',
							message: 'The password and its confirm are not the same'
						}
					}
				}
			}
		});
	}

	module.exports = registerFormValidation;



/***/ },
/* 10 */
/***/ function(module, exports) {

	var lost = Class({
		'extends': MK.Object,
		constructor: function () {
			this.on('afterrender', () => {
				this.bindNode('pageLink', ':sandbox .page-link')
					.on('click::pageLink', (evt)=> {
						this.trigger('wantPage', evt.target.pathname)
					});
			});
		}
	});

	module.exports = lost;

/***/ },
/* 11 */
/***/ function(module, exports) {

	var Session = Class({
		'extends': MK.Object,
		constructor: function (data) {
			this
				.onDebounce('change', ()=> {
					console.log('session change',this);
					localStorage.setItem('session', JSON.stringify(this));
				},100)
				.on('change:user_id', (evt)=> {
					console.log('user_id change',evt);
					this.trigger('userEvent',evt.value)
				})
				.bindNode('btnLogout', '#logout')
				.on('click::btnLogout',()=>{this.trigger('logoutEvent','manual')});
			this.parseBindings($('#session'));
		},
		refresh: function() {
			console.log('this.token', this.token);
			if (this.token && this.password) {
				var me = this;
				$.ajax({
					type: "POST",
					contentType: "application/json",
					url: '/auth/refresh',
					headers: {'Authorization': 'Bearer ' + me.token + ':' + me.password},
					dataType: "json"
				})
					.done(function (data) {
						console.log(me, data);
						me.expires = data.expires;
						//TODO check others returned user data and logout if they change
					})
					.fail(function (answer) {
						console.log('fail', answer);
						if (answer.status==401) me.trigger('logoutEvent','expired')
					})
					/*.always(function() {
					 alert( "complete" );
					 })*/;
			}
		},
	});

	module.exports = Session;

/***/ },
/* 12 */
/***/ function(module, exports) {

	var
		$popoverLink = $('[data-popover]'),
		$document = $(document);

	function init() {
		$popoverLink.on('click', openPopover);
		$document.on('click', closePopover);
	}

	function openPopover(e) {
		e.preventDefault();
		closePopover();
		$(e.currentTarget).addClass('active');
		var popover = $($(this).data('popover'));
		popover.addClass('open');
		e.stopImmediatePropagation();
	}

	function closePopover(e) {
		if($('.popover.open').length > 0) {
			$('.popover').removeClass('open');
			$popoverLink.removeClass('active');
		}
	}

	module.exports = init;

/***/ }
/******/ ]);