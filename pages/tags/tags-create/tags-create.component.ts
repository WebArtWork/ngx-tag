import { Component } from '@angular/core';
import { TagService } from '../../../services/tag.service';

@Component({
  selector: 'app-tags-create',
  templateUrl: './tags-create.component.html',
  styleUrl: './tags-create.component.scss'
})
export class TagsCreateComponent {
	constructor(private _ts: TagService) { }
	chatGPT = `Here is a schema for a MongoDB collection:
	mongoose.Schema({
		name: String,
		url: String,
		description: String
	})
	Please review this schema. I will provide you with specific details about the documents I need you to generate in a follow-up message. For now, do not create or suggest any documents; just acknowledge the schema and wait for my next instructions. I need you to generate data in format of JSON, array with objects. All fields keep as they are url out of name field and use english letters only without space and special characters.`;
	close: () => void;
	setTags: () => void;
	entities = '';
	store: string;
	parent: string;
	create() {
		const entities = JSON.parse(this.entities);
		let count = entities.length;
		for (const entity of entities) {
			if (this.store) {
				entity.stores = [this.store];
			}
			if (this.parent) {
				entity.parent = [this.parent];
			}
			this._ts.create(entity, ()=>{
				if (--count === 0) {
					this.setTags();
				}
			});
		}
	}
}
