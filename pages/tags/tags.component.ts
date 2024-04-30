import { Component } from '@angular/core';
import { FormService } from 'src/app/modules/form/form.service';
import { FormInterface } from 'src/app/modules/form/interfaces/form.interface';
import { TranslateService } from 'src/app/modules/translate/translate.service';
import {
	AlertService,
	CoreService,
	ModalService,
	MongoService,
	StoreService as _StoreService
} from 'wacom';
import { Tag, TagService } from '../../services/tag.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TagsCreateComponent } from './tags-create/tags-create.component';
import { UserService } from 'src/app/core';
import { Store, StoreService } from '../../../store/services/store.service';

@Component({
	templateUrl: './tags.component.html',
	styleUrls: ['./tags.component.scss']
})
export class TagsComponent {
	parent = '';
	childrenUrl(tag: Tag): string {
		const urls = this._router.url.split('/');
		if (this.parent) {
			urls.pop();
		}
		urls.push(tag._id);
		return urls.join('/');
	}

	columns = ['enabled', 'name', 'description'];

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
			},
			{
				name: 'Photo',
				key: 'thumb',
				fields: [
					{
						name: 'Label',
						value: 'Image'
					}
				]
			},
			{
				name: 'Select',
				key: 'stores',
				fields: [
					{
						name: 'Placeholder',
						value: 'fill your stores'
					},
					{
						name: 'Label',
						value: 'Stores'
					},
					{
						name: 'Multiple',
						value: true
					},
					{
						name: 'Items',
						value: this.stores
					}
				]
			}
		]
	});

	config = {
		create: () => {
			this._form.modal<Tag>(this.form, {
				label: 'Create',
				click: (created: unknown, close: () => void) => {
					if (this.parent) {
						(created as Tag).parent = this.parent;
					}
					this._ts.create(created as Tag, ()=>{
						this.setTags();
						this.sort();
					});
					close();
				}
			}, this.store ? { stores: [this.store]} : {});
		},
		update: (doc: Tag) => {
			this._form.modal<Tag>(this.form, [], doc).then((updated: Tag) => {
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
							this._ts.delete(doc, this.setTags.bind(this));
						}
					}
				]
			});
		},
		buttons: [
			{
				icon: 'label_important',
				hrefFunc: this.childrenUrl.bind(this)
			},{
				icon: 'arrow_upward',
				click: (doc: Tag) => {
					const index = this.tags.findIndex(d => d._id === doc._id);
					[this.tags[index], this.tags[index - 1]] = [this.tags[index - 1], this.tags[index]];
					this.sort();
				}
			}
		],
		headerButtons: [
			this._us.role('admin') || this._us.role('agent')
				? {
						icon: 'add_circle',
						click: () => {
							this._modal.show({
								setTags: this.setTags.bind(this),
								component: TagsCreateComponent,
								parent: this.parent,
								store: this.store,
							});
						}
				  }
				: null
		]
	};

	sort() {
		for (let i = 0; i < this.tags.length; i++) {
			if (this.tags[i].order !== i) {
				this.tags[i].order = i;
				this._ts.save(this.tags[i], () => { }, '');
			}
		}
	}
	tags: Tag[] = [];
	setTags() {
		this.tags.splice(0, this.tags.length);
		for (const tag of this._ts.tags) {
			tag.stores = tag.stores || [];
			if (!this.store && !this.parent) {
				if (!tag.parent) {
					this.tags.push(tag);
				}
			} else if (this.store && this.parent) {
				if (
					tag.parent === this.parent &&
					tag.stores.includes(this.store)
				) {
					this.tags.push(tag);
				}
			} else if (this.parent) {
				if (tag.parent === this.parent) {
					this.tags.push(tag);
				}
			} else {
				if (tag.stores.includes(this.store)) {
					this.tags.push(tag);
				}
			}
		}
	}

	update(tag: Tag) {
		this._ts.update(tag);
	}

	get stores(): Store[] {
		return this._ss.stores;
	}
	store: string;
	setStore(store: string) {
		this.store = store;
		this._store.set('store', store);
		this.setTags();
	}

	constructor(
		private _translate: TranslateService,
		private route: ActivatedRoute,
		private _alert: AlertService,
		private _modal: ModalService,
		private _mongo: MongoService,
		private _store: _StoreService,
		private _form: FormService,
		private _core: CoreService,
		private _ss: StoreService,
		private _us: UserService,
		private _ts: TagService,
		private _router: Router
	) {
		this._store.get('store', this.setStore.bind(this));
		this._mongo.on('tag', this.setTags.bind(this));
	}

	ngOnInit(): void {
		this.route.params.subscribe((params) => {
			if (params['parent']) {
				this.parent = params['parent'];
				this.setTags();
			}
		});
	}
}
