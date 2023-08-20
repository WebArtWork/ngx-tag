import { Injectable } from '@angular/core';
import { environment } from '@environment/environment';
import { MongoService, AlertService } from 'wacom';
import { CategoryService } from './category.service';

export interface Tag {
	_id: string;
	module: string;
	category: string;
	name: string;
	description: string;
}

@Injectable({
	providedIn: 'root'
})
export class TagService {
	groups = (environment as unknown as { groups: string[] }).groups || ['product'];

	product_categories = [
		{ _id: "Одяг", name: "Одяг" },
		{ _id: "Взуття", name: "Взуття" },
		{ _id: "Аксесуари", name: "Аксесуари" },
		{ _id: "Сумки", name: "Сумки" },
		{ _id: "Косметика", name: "Косметика" },
		{ _id: "Техніка", name: "Техніка" },
		{ _id: "Тканини", name: "Тканини" }
	];

	tags: Tag[] = [];

	_tags: Record<string, unknown> = {};

	new(): Tag {
		return {} as Tag;
	}

	group(group: string): Tag[] {
		const tags: Tag[] = [];

		this.mongo.on('category tag', ()=>{
			const categoryIds = this._cs.group(group).map(c=>c._id);

			for (const categoryId of categoryIds) {
				for (const tag of (this._tags['category'] as Record<string, Tag[]>)[categoryId] || []) {
					tags.push(tag);
				}

			}
		});

		return tags;
	}

	category(category: string): Tag[] {
		if (this._tags['category']) {
			return (this._tags['category'] as Record<string, Tag[]>)[category];
		} else {
			const tags: Tag[] = [];

			this.mongo.on('tag', ()=>{
				for (const tag of (this._tags['category'] as Record<string, Tag[]>)[category] || []) {
					tags.push(tag);
				}
			});

			return tags;
		}
	}

	constructor(
		private _cs: CategoryService,
		private mongo: MongoService,
		private alert: AlertService
	) {
		this.tags = mongo.get('tag', {
			groups: 'category'
		}, (tags: Tag[], obj: Record<string, unknown>) => {
			this._tags = obj;
		});
	}

	create(
		tag: Tag = this.new(),
		callback = (created: Tag) => {},
		text = 'tag has been created.'
	) {
		if (tag._id) {
			this.save(tag);
		} else {
			this.mongo.create('tag', tag, (created: Tag) => {
				callback(created);
				this.alert.show({ text });
			});
		}
	}

	doc(tagId: string): Tag {
		if(!this._tags[tagId]){
			this._tags[tagId] = this.mongo.fetch('tag', {
				query: {
					_id: tagId
				}
			});
		}
		return this._tags[tagId] as Tag;
	}

	update(
		tag: Tag,
		callback = (created: Tag) => {},
		text = 'tag has been updated.'
	): void {
		this.mongo.afterWhile(tag, ()=> {
			this.save(tag, callback, text);
		});
	}

	save(
		tag: Tag,
		callback = (created: Tag) => {},
		text = 'tag has been updated.'
	): void {
		this.mongo.update('tag', tag, () => {
			if(text) this.alert.show({ text, unique: tag });
		});
	}

	delete(
		tag: Tag,
		callback = (created: Tag) => {},
		text = 'tag has been deleted.'
	): void {
		this.mongo.delete('tag', tag, () => {
			if(text) this.alert.show({ text });
		});
	}
}
