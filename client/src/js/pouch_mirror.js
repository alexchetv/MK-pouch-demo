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
