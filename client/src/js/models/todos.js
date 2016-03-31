"use strict";
var Todo = require('./todo');
var PouchMirror = require('../pouch_mirror');

var Todos = Class({
	'extends': MK.Array,
	Model: Todo,
	itemRenderer: '#todo-item-template',
	constructor: function (session) {
		this
			.bindNode('sandbox', '#todo-list')
			.linkProps('DBs',[session,'userDBs'],(a) => {return a;})
			//TODO check of exist todos DB
			.set('dataSource',new PouchMirror({local:'todos',remote:this.DBs.todos}))
			.recreate([{},{}]);
		console.log('this.DBs',this.DBs);
	}

});

module.exports = Todos;