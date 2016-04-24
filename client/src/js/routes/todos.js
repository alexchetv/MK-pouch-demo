"use strict";
var Todo = require('../models/todo');
var PouchMirror = require('../pouch_mirror');
var ArrayPage = require('./array_page');

var Todos = Class({
	'extends': ArrayPage,
	title:'Todos',
	renderer:
		`<h4>Todos</h4>
	<input class="new-todo u-full-width" placeholder="What needs to be done?" autofocus>
	<ul id="todo-list"></ul>`,
	Model: Todo,
	constructor: function (session) {
		this.setTitle(session.name);
		this.set('DBs', session.userDBs);
		if (this.DBs.todos) {
			this.set('dataSource', new PouchMirror(
				{
					local: 'todos_'+session.user_id,
					remote: this.DBs.todos,
					type: 'todo',
					remoteOptions: {
						auto_compaction: true
					}
				}
			));
		} else {
			session.logout('No Database Found');
		}
		this.on('dataSource@dbReady', (data) => {
			this.recreate(data);
		});
		this.on('dataSource@unauthorizedEvent', (data) => {
			session.logout('Access  not allowed');
		});
		this.on('dataSource@dbUpdate', (doc) => {
			for (let index = this.length - 1; index >= 0; index--) {
				let todo = this[index];
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
				this
					.bindNode('container', '#todo-list')
					.bindNode('newTodo', ':sandbox .new-todo')
			})
			.on('*@editEvent', function (item) {
				this.editingTodo = item;
			})
			.on('beforechange:editingTodo', () => {
				if (this.editingTodo) this.editingTodo.editing = false;
			})
			.on('change:editingTodo',  () => {
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
	},
	wipeOut:function(){
		this.dataSource.stopSync();
		this.dataSource.change.cancel();
		this.dataSource.replicateMemoryToDisk.cancel();
		this.dataSource.remoteDb = null;
		this.dataSource.diskDb = null;
		this.dataSource.db.destroy()
			.then(()=>{
				this.dataSource.db = null;
				this.dataSource = null;
		});


	}
});
module.exports = Todos;