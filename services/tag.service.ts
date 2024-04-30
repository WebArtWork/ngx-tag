import { Injectable } from '@angular/core';
import { MongoService, AlertService } from 'wacom';

export interface Tag {
	_id: string;
	enabled: boolean;
	parent: string;
	name: string;
	order: number;
	description: string;
	stores: string[];
}

@Injectable({
	providedIn: 'root'
})
export class TagService {
	tags: Tag[] = [];
	rootTags: Tag[] = [];
	childrenTags: Record<string, Tag[]> = {};
	_tags: Record<string, unknown> = {};
	new(): Tag {
		return {} as Tag;
	}

	constructor(
		private mongo: MongoService,
		private alert: AlertService
	) {
		this.tags = mongo.get('tag', {
			groups: {
				parent: {
					sort: mongo.sortAscNumber('order'),
					field: (doc: Tag) => doc.parent
				}
			},
			sort: mongo.sortAscNumber('order'),
		}, (tags: Tag[], obj: Record<string, unknown>) => {
			this.rootTags = obj['rootTags'] as Tag[];
			this.childrenTags = obj['parent'] as Record<string, Tag[]>;
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
		callback = () => {},
		text = 'tag has been updated.'
	): void {
		this.mongo.afterWhile(tag, ()=> {
			this.save(tag, callback, text);
		});
	}

	save(
		tag: Tag,
		callback = () => {},
		text = 'tag has been updated.'
	): void {
		this.mongo.update('tag', tag, () => {
			if (text) this.alert.show({ text, unique: tag });
			if (typeof callback === 'function') {
				callback();
			}
		});
	}

	delete(
		tag: Tag,
		callback = () => {},
		text = 'tag has been deleted.'
	): void {
		this.mongo.delete('tag', tag, () => {
			if (text) this.alert.show({ text });
			if (typeof callback === 'function') {
				callback();
			}
		});
	}
}
