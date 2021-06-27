import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecuritycodesComponent } from './components/securitycodes/securitycodes.component';
import { AdminDoctorsComponent } from './components/admin-doctors/admin-doctors.component';
import { AdminPharmaciesComponent } from './components/admin-pharmacies/admin-pharmacies.component';
import { UicComponent } from './components/uic/uic.component';
import { DoctorProfileComponent } from './components/doctor-profile/doctor-profile.component';
import { PharmacyProfileComponent } from './components/pharmacy-profile/pharmacy-profile.component';

const routes: Routes = [
  {path: 'cui', component: UicComponent},
  {path: 'securitycode', component: SecuritycodesComponent},
  {path: 'adminDoctors', component: AdminDoctorsComponent},
  {path: 'adminPharmacies', component: AdminPharmaciesComponent},
  {path: 'doctorProfile', component: DoctorProfileComponent},
  {path: 'pharmacyProfile', component: PharmacyProfileComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
