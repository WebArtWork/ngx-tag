import { NgModule } from '@angular/core';
import { CoreModule } from 'src/app/core';
import { CategoriesComponent } from './categories.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [{
	path: '',
	component: CategoriesComponent
}];

@NgModule({
	imports: [
		RouterModule.forChild(routes),
		CoreModule
	],
	declarations: [
		CategoriesComponent
	],
	providers: []

})

export class CategoriesModule { }
