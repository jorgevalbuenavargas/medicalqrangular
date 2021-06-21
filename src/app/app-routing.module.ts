import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecuritycodesComponent } from './components/securitycodes/securitycodes.component';
import { UicComponent } from './components/uic/uic.component';

const routes: Routes = [
  {path: 'cui', component: UicComponent},
  {path: 'securitycode', component: SecuritycodesComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
