import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core';
import { TagsComponent } from './tags.component';
import { Routes, RouterModule } from '@angular/router';
import { SelectModule } from 'src/app/modules/select/select.module';
import { TagsCreateComponent } from './tags-create/tags-create.component';

const routes: Routes = [
	{
		path: '',
		component: TagsComponent
	},
	{
		path: ':parent',
		component: TagsComponent
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes), SelectModule, CoreModule],
	declarations: [TagsComponent, TagsCreateComponent],
	providers: []
})
export class TagsModule {}
