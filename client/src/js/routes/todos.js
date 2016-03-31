"use strict";
var Todo = require('../models/todo');
var PouchMirror = require('../pouch_mirror');

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
		this.on('dataSource@dbUpdate', (docs) => {
			console.log('dataSource@dbUpdate', docs);
			for (let index = this.length - 1; index >= 0; index--) {
				let todo = this[index];
				console.log('each', todo);
				for (let i = docs.length - 1; i >= 0; i--) {
					console.log ('doc',docs[i])
					if (docs[i]._id === todo._id) {
						if (docs[i]._deleted) {
							this.pull(index);
						} else {
							todo._rev = docs[i]._rev;
							todo.title = docs[i].title;
							todo.complete = docs[i].complete;
						}
						docs.splice(i, 1);
					}
				}
			}
			docs.forEach((doc) => {
					this.push(new Todo(doc,this));
			})
		});
		this
			.on('afterrender', function (evt) {
				console.log('todos render', evt);
				this
					.bindNode('container', '#todo-list')
					.bindNode('newTodo', ':sandbox .new-todo')
			})
			.on('*@editEvent',function(item) {
				console.log('editEvent',item);
				this.editingTodo = item;
			})
			.on('change:editingTodo',function(evt) {
				console.log('change',evt);
				if (evt.previousValue) evt.previousValue.editing=false;
				if (evt.value) evt.value.editing=true;
			})
			.on('focus::newTodo', function(evt) {
				this.editingTodo = null;
			})
			.on('keyup::newTodo', function(evt) {
				var newValue;
				if (evt.which === 27) {
					this.newTodo = '';
				} else if (evt.which === 13) {
					if (newValue = this.newTodo.trim()) {
						this.dataSource.put({
							title: newValue,
							complete:false
						},'todo').then(function (response) {
							console.log('response',response);
						}).catch(function (err) {
							console.log('err',err);
						});
						this.newTodo = '';
					}
				}
			});
	}
});

module.exports = Todos;