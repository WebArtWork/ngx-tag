import { Component } from '@angular/core';
import {
	FormService
} from 'src/app/modules/form/form.service';

import { CategoryService, Category } from "src/app/modules/tag/services/category.service";
import { TranslateService } from 'src/app/modules/translate/translate.service';
import { AlertService, CoreService } from 'wacom';

@Component({
	templateUrl: './categories.component.html',
	styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent {
	columns = ['name', 'description'];

	groups = this._cs.groups.map(m => {
		return {
			name: m,
			_id: m
		}
	});

	group = this.groups[0]._id;

	form = this._form.getForm('category', {
		components: [
			{
				name: 'Text',
				key: 'name',
				focused: true,
				fields: [
					{
						name: 'Placeholder',
						value: 'fill category name'
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
						value: 'fill category description'
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
				.modal<Category>(this.form, {
					label: 'Create',
					click: (created: unknown, close: () => void) => {
						(created as Category).group = this.group;
						this._cs.create(created as Category);
						close();
					}
				});
		},
		update: (doc: Category) => {
			this._form
				.modal<Category>(this.form, [], doc)
				.then((updated: Category) => {
					this._core.copy(updated, doc);
					this._cs.save(doc);
				});
		},
		delete: (doc: Category) => {
			this._alert.question({
				text: this._translate.translate(
					'Common.Are you sure you want to delete this category?'
				),
				buttons: [
					{
						text: this._translate.translate('Common.No')
					},
					{
						text: this._translate.translate('Common.Yes'),
						callback: () => {
							this._cs.delete(doc);
						}
					}
				]
			});
		}
	};

	get rows(): Category[] {
		return this._cs._categories.group ? this._cs._categories.group[this.group] : [];
	}

	constructor(
		private _translate: TranslateService,
		private _alert: AlertService,
		private _cs: CategoryService,
		private _form: FormService,
		private _core: CoreService
	) {}
}
