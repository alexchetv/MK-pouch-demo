"use strict";
var Todo = Class({
	'extends': MK.Object,
	renderer:
		`<li>
		<div class="view">
			<button class="done"></button>
			<label></label>
			<button class="destroy"></button>
		</div>
		<input class="edit">
	</li>`,
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
			.on('dblclick::title', (evt) =>{
				evt.preventDefault();
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
				parent.dataSource.pull(JSON.stringify(this));
			})
			.on('click::done', function() {
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