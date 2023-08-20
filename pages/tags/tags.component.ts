import { Component } from '@angular/core';
import { Category, CategoryService } from 'src/app/modules/tag/services/category.service';
import { FormService } from 'src/app/modules/form/form.service';
import { FormInterface } from 'src/app/modules/form/interfaces/form.interface';
import { TranslateService } from 'src/app/modules/translate/translate.service';
import { AlertService, CoreService, MongoService } from 'wacom';
import { Tag, TagService } from '../../services/tag.service';

@Component({
	templateUrl: './tags.component.html',
	styleUrls: ['./tags.component.scss']
})
export class TagsComponent {
	columns = ['name', 'description'];

	groups = this._cs.groups.map(m => {
		return {
			name: m,
			_id: m
		}
	});

	group = this.groups[0]._id;

	setGroup(group: string) {
		this.group = group;
		this.category = '';
		setTimeout(() => {// TODO: make wselect to work with items change
			this.category = this.categories.length ? this.categories[0]._id : '';
		}, 1);
	}

	category: string;

	form: FormInterface = this._form.getForm('tag', {
		components: [
			{
				name: 'Text',
				key: 'name',
				focused: true,
				fields: [
					{
						name: 'Placeholder',
						value: 'fill your name'
					},
					{
						name: 'Label',
						value: 'Name'
					}
				]
			},
			{
				name: 'Text',
				key: 'description',
				fields: [
					{
						name: 'Placeholder',
						value: 'fill your description'
					},
					{
						name: 'Label',
						value: 'Description'
					}
				]
			}
		]
	});

	config = {
		create: () => {
			this._form
				.modal<Tag>(this.form, {
					label: 'Create',
					click: (created: unknown, close: () => void) => {
						(created as Tag).category = this.category;
						this._ts.create(created as Tag);
						close();
					}
				});
		},
		update: (doc: Tag) => {
			this._form
				.modal<Tag>(this.form, [], doc)
				.then((updated: Tag) => {
					this._core.copy(updated, doc);
					this._ts.save(doc);
				});
		},
		delete: (doc: Tag) => {
			this._alert.question({
				text: this._translate.translate(
					'Common.Are you sure you want to delete this tag?'
				),
				buttons: [
					{
						text: this._translate.translate('Common.No')
					},
					{
						text: this._translate.translate('Common.Yes'),
						callback: () => {
							this._ts.delete(doc);
						}
					}
				]
			});
		}
	};

	get rows(): Tag[] {
		return this._ts.category(this.category);
	}

	get categories(): Category[] {
		return this._cs.group(this.group);
	}

	constructor(
		private _translate: TranslateService,
		private _alert: AlertService,
		private _cs: CategoryService,
		private _mongo: MongoService,
		private _form: FormService,
		private _core: CoreService,
		private _ts: TagService
	) {
		this._mongo.on('category', ()=>{
			this.category = this.categories[0]._id;
		});
	}
}
