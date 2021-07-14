import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { DoctorUicComponent } from './components/doctor-uic/doctor-uic.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UicComponent } from './components/uic/uic.component';
import { SecuritycodesComponent } from './components/securitycodes/securitycodes.component';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxBootstrapIconsModule, allIcons } from 'ngx-bootstrap-icons';
import { AdminDoctorsComponent } from './components/admin-doctors/admin-doctors.component';
import { AdminPharmaciesComponent } from './components/admin-pharmacies/admin-pharmacies.component';
import { DoctorProfileComponent } from './components/doctor-profile/doctor-profile.component';
import { PharmacyProfileComponent } from './components/pharmacy-profile/pharmacy-profile.component';
import { MedicalPrescriptionsComponent } from './components/medical-prescriptions/medical-prescriptions.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AdminMedicalreceiptsComponent } from './components/admin-medicalreceipts/admin-medicalreceipts.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { AdminProfileComponent } from './components/admin-profile/admin-profile.component';
import { PharmacyMedicalPrescriptionsComponent } from './components/pharmacy-medical-prescriptions/pharmacy-medical-prescriptions.component';
import {firebase, firebaseui, FirebaseUIModule} from 'firebaseui-angular';
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule, USE_EMULATOR as USE_AUTH_EMULATOR} from '@angular/fire/auth';
import {environment} from '../assets/environments/environment';

const firebaseUiAuthConfig: firebaseui.auth.Config = {
  signInFlow: 'popup',
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    /*{
      scopes: [
        'public_profile',
        'email',
        'user_likes',
        'user_friends'
      ],
      customParameters: {
        'auth_type': 'reauthenticate'
      },
      provider: firebase.auth.FacebookAuthProvider.PROVIDER_ID
    },*/
    //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    //firebase.auth.GithubAuthProvider.PROVIDER_ID,
    /*{
      requireDisplayName: false,
      provider: firebase.auth.EmailAuthProvider.PROVIDER_ID
    },*/
    //firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    //firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
  ],
  //tosUrl: '<your-tos-link>',
  //privacyPolicyUrl: '<your-privacyPolicyUrl-link>',
  //credentialHelper: firebaseui.auth.CredentialHelper.GOOGLE_YOLO
};

@NgModule({
  declarations: [
    AppComponent,
    DoctorUicComponent,
    NavbarComponent,
    UicComponent,
    SecuritycodesComponent,
    AdminDoctorsComponent,
    AdminPharmaciesComponent,
    DoctorProfileComponent,
    PharmacyProfileComponent,
    MedicalPrescriptionsComponent,
    AdminMedicalreceiptsComponent,
    RegistrationComponent,
    LoginComponent,
    AdminProfileComponent,
    PharmacyMedicalPrescriptionsComponent,    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    QRCodeModule,
    FormsModule,
    ReactiveFormsModule,
    NgxBootstrapIconsModule.pick(allIcons),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    FirebaseUIModule.forRoot(firebaseUiAuthConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
