import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { MongoService, AlertService } from 'wacom';

export interface Category {
	_id: string;
	group: string;
	name: string;
	description: string;
}

@Injectable({
	providedIn: 'root'
})
export class CategoryService {
	groups = (environment as unknown as { groups: string[] }).groups || [
		'article'
	];

	categories: Category[] = [];

	_categories: any = {};

	new(): Category {
		return {} as Category;
	}

	constructor(private mongo: MongoService, private alert: AlertService) {
		this.categories = mongo.get(
			'category',
			{
				groups: 'group'
			},
			(arr: any, obj: any) => {
				this._categories = obj;
			}
		);
	}

	group(group: string): Category[] {
		if (this._categories.group) {
			if (!this._categories.group[group]) {
				this._categories.group[group] = [];
			}
			return this._categories.group[group];
		} else {
			const categories: Category[] = [];

			this.mongo.on('category', () => {
				for (const category of this._categories.group[group]) {
					categories.push(category);
				}
			});

			return categories;
		}
	}

	create(
		category: Category = this.new(),
		callback = (created: Category) => {},
		text = 'category has been created.'
	) {
		if (category._id) {
			this.save(category);
		} else {
			this.mongo.create('category', category, (created: Category) => {
				callback(created);
				this.alert.show({ text });
			});
		}
	}

	doc(categoryId: string): Category {
		if (!this._categories[categoryId]) {
			this._categories[categoryId] = this.mongo.fetch('category', {
				query: {
					_id: categoryId
				}
			});
		}
		return this._categories[categoryId];
	}

	update(
		category: Category,
		callback = (created: Category) => {},
		text = 'category has been updated.'
	): void {
		this.mongo.afterWhile(category, () => {
			this.save(category, callback, text);
		});
	}

	save(
		category: Category,
		callback = (created: Category) => {},
		text = 'category has been updated.'
	): void {
		this.mongo.update('category', category, () => {
			if (text) this.alert.show({ text, unique: category });
		});
	}

	delete(
		category: Category,
		callback = (created: Category) => {},
		text = 'category has been deleted.'
	): void {
		this.mongo.delete('category', category, () => {
			if (text) this.alert.show({ text });
		});
	}
}
