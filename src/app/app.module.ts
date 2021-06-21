import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { DoctorUicComponent } from './components/doctor-uic/doctor-uic.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { UicComponent } from './components/uic/uic.component';
import { SecuritycodesComponent } from './components/securitycodes/securitycodes.component';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxBootstrapIconsModule, allIcons } from 'ngx-bootstrap-icons';

@NgModule({
  declarations: [
    AppComponent,
    DoctorUicComponent,
    NavbarComponent,
    UicComponent,
    SecuritycodesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    QRCodeModule,
    NgxBootstrapIconsModule.pick(allIcons)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
