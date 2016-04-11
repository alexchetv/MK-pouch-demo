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
				return (a === 'up');
			})
			.on('change:online',(evt) =>{
				//console.log('online change',evt);
				if(this.online) this.startSync(); else this.stopSync();
			})
			.set('db', new PouchDB(data.local + '_mem', {adapter: 'memory', auto_compaction: true}))
			.set('diskDb', new PouchDB(data.local, {auto_compaction: true}))
			.set('type', data.type)
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
		console.log('onComplete',info);
		this.trigger('ReplicationPaused');
		// This means the sync was cancelled
		// These should show up under the 'error' handler but PouchDB is firing 'complete' instead
		if (this.checkUnauthorized(info)) {
			console.log('unauthorizedEvent',info);
			this.trigger('unauthorizedEvent', {"info": info});
		} else {
			console.log('ReplicationComplete',info);
			this.trigger('ReplicationComplete', {"info": info});
		}
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
	},
	checkUnauthorized: function(info) {
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
});

module.exports = PouchMirror;
