import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core';
import { TagsComponent } from './tags.component';
import { Routes, RouterModule } from '@angular/router';
import { SelectModule } from 'src/app/modules/select/select.module';

const routes: Routes = [{
	path: '',
	component: TagsComponent
}];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		SelectModule,
		CoreModule
	],
	declarations: [
		TagsComponent
	],
	providers: []

})

export class TagsModule { }
